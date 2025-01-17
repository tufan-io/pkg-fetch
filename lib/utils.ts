import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';
import { spawnSync, SpawnSyncOptions } from 'child_process';
import stream from 'stream';

import { log, wasReported } from './log';

export async function downloadUrl(url: string, file: string) {
  log.enableProgress(path.basename(file));
  log.showProgress(0);

  const tempFile = `${file}.downloading`;

  fs.mkdirpSync(path.dirname(tempFile));

  const ws = fs.createWriteStream(tempFile);

  log.info(`Downloading ${url}`);
  return axios
    .get(url, { responseType: 'stream' })
    .then(({ data, headers }) => {
      const totalSize = headers['content-length'];
      let currentSize = 0;

      data.on('data', (chunk: string) => {
        if (totalSize != null && totalSize !== 0) {
          currentSize += chunk.length;
          log.showProgress((currentSize / totalSize) * 100);
        }
      });
      data.pipe(ws);

      return promisify(stream.finished)(ws).then(() => {
        log.showProgress(100);
        log.disableProgress();
        fs.moveSync(tempFile, file);
      });
    })
    .catch((e: AxiosError) => {
      log.disableProgress();
      fs.rmSync(tempFile);
      if (e.response) {
        throw wasReported(`${e.response.status}`);
      } else {
        throw wasReported(e.message);
      }
    });
}

export async function hash(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const resultHash = crypto.createHash('sha256');
    const input = fs.createReadStream(filePath);

    input.on('error', (e) => {
      reject(e);
    });

    input.on('readable', () => {
      const data = input.read();
      if (data) {
        resultHash.update(data);
      } else {
        resolve(resultHash.digest('hex'));
      }
    });
  });
}

export async function plusx(file: string) {
  const s = await fs.stat(file);
  const newMode = s.mode | 64 | 8 | 1;
  if (s.mode === newMode) return;
  const base8 = newMode.toString(8).slice(-3);
  await fs.chmod(file, base8);
}

export async function spawn(
  command: string,
  args?: ReadonlyArray<string>,
  options?: SpawnSyncOptions
): Promise<void> {
  const { error } = spawnSync(command, args, options);
  if (error) {
    throw error;
  }
}
