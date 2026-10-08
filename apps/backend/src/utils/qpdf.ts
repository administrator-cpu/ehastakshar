import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execFileAsync = promisify(execFile);

export class QpdfHelper {
  /**
   * Encrypts a PDF buffer using qpdf.
   * @param inputBuffer The unencrypted PDF buffer.
   * @param password The password to encrypt with.
   * @returns The encrypted PDF buffer.
   */
  static async encryptPdf(inputBuffer: Buffer, password: string): Promise<Buffer> {
    const tempId = uuidv4();
    const inputPath = path.join(os.tmpdir(), `${tempId}_in.pdf`);
    const outputPath = path.join(os.tmpdir(), `${tempId}_out.pdf`);

    try {
      await fs.writeFile(inputPath, inputBuffer);
      // qpdf --encrypt {user_password} {owner_password} 256 -- input.pdf output.pdf
      await execFileAsync('qpdf', [
        '--encrypt',
        password,
        password,
        '256',
        '--',
        inputPath,
        outputPath
      ]);
      const outputBuffer = await fs.readFile(outputPath);
      return outputBuffer;
    } catch (error) {
      throw new Error(`Failed to encrypt PDF: ${(error as Error).message}`);
    } finally {
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
    }
  }

  /**
   * Decrypts a PDF buffer using qpdf.
   * @param inputBuffer The encrypted PDF buffer.
   * @param password The password to decrypt with.
   * @returns The decrypted PDF buffer.
   */
  static async decryptPdf(inputBuffer: Buffer, password: string): Promise<Buffer> {
    const tempId = uuidv4();
    const inputPath = path.join(os.tmpdir(), `${tempId}_in.pdf`);
    const outputPath = path.join(os.tmpdir(), `${tempId}_out.pdf`);

    try {
      await fs.writeFile(inputPath, inputBuffer);
      // qpdf --password={password} --decrypt input.pdf output.pdf
      await execFileAsync('qpdf', [
        `--password=${password}`,
        '--decrypt',
        inputPath,
        outputPath
      ]);
      const outputBuffer = await fs.readFile(outputPath);
      return outputBuffer;
    } catch (error) {
      throw new Error(`Failed to decrypt PDF (incorrect password?): ${(error as Error).message}`);
    } finally {
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
    }
  }

  /**
   * Checks if a PDF buffer is encrypted.
   * @param inputBuffer The PDF buffer.
   * @returns boolean
   */
  static async isEncrypted(inputBuffer: Buffer): Promise<boolean> {
    const tempId = uuidv4();
    const inputPath = path.join(os.tmpdir(), `${tempId}_in.pdf`);

    try {
      await fs.writeFile(inputPath, inputBuffer);
      // qpdf --check input.pdf (it exits with code 2 or throws if encrypted and no password)
      await execFileAsync('qpdf', ['--check', inputPath]);
      return false; // If it checks fine without password, it's not encrypted
    } catch (error: any) {
      if (error.message && (error.message.includes('password') || error.message.includes('encrypted'))) {
        return true;
      }
      // If it throws an error that says it's encrypted
      if (error.stderr && (error.stderr.includes('password') || error.stderr.includes('encrypted'))) {
        return true;
      }
      return false; 
    } finally {
      await fs.unlink(inputPath).catch(() => {});
    }
  }
}
