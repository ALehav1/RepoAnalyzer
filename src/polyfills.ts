import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window;
  window.process = {
    env: {},
    version: '',
    versions: {},
    platform: '',
    nextTick: (cb: Function) => setTimeout(cb, 0)
  } as any;
}
