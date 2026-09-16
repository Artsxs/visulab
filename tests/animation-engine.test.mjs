import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AnimationEngine } from '../js/animation-engine.mjs';
const originalRequest = globalThis.requestAnimationFrame;
const originalCancel = globalThis.cancelAnimationFrame;
afterEach(() => { globalThis.requestAnimationFrame = originalRequest; globalThis.cancelAnimationFrame = originalCancel; });
function clockEngine(options = {}) {
  const frames = new Map(); let id = 0;
  globalThis.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = key => frames.delete(key);
  const engine = new AnimationEngine({ replaceChildren() {} }, options);
  // Isola o relógio do DOM; renderização e WAAPI são verificadas no navegador.
  engine.mount = () => engine.notify();
  engine.load({ cenas: [1000, 1500, 1000].map(duracaoMs => ({ duracaoMs })) });
  const advance = ms => {
    const entry = frames.entries().next().value;
    assert.ok(entry, 'há um quadro agendado');
    frames.delete(entry[0]); entry[1](engine.lastTime + ms);
  };
  return { engine, frames, advance };
}
test('autoplay, pausa e retomada mantêm apenas um relógio ativo', () => {
  const { engine, frames, advance } = clockEngine();
  assert.equal(engine.playing, true); advance(200); engine.pause();
  assert.equal(engine.elapsed, 200); assert.equal(frames.size, 0);
  engine.play(); engine.play(); assert.equal(frames.size, 1);
  engine.setSpeed(2); advance(100); assert.ok(Math.abs(engine.elapsed - 400) < 5);
  engine.destroy(); assert.equal(frames.size, 0);
});
test('quadros atrasados preservam tempo entre cenas e encerram em 100%', () => {
  let progress;
  const { engine, advance, frames } = clockEngine({ onProgress: value => { progress = value; } });
  advance(2700); assert.equal(engine.index, 2); assert.equal(engine.elapsed, 200);
  advance(800); assert.equal(engine.playing, false); assert.equal(progress, 1); assert.equal(frames.size, 0);
  engine.restart(); assert.equal(engine.index, 0); assert.equal(engine.elapsed, 0); assert.equal(frames.size, 1);
  engine.destroy();
});
test('movimento reduzido nunca agenda quadros e permite concluir manualmente', () => {
  let progress;
  const { engine, frames } = clockEngine({ reducedMotion: true, onProgress: value => { progress = value; } });
  assert.equal(engine.playing, false); assert.equal(frames.size, 0);
  engine.seek(2); assert.equal(progress, 1); engine.play(); assert.equal(frames.size, 0);
  engine.destroy();
});

test('trocar experiência invalida callback antigo e cancela recursos', () => {
  const { engine, frames } = clockEngine();
  const stale = frames.values().next().value;
  engine.load({ cenas: [{ duracaoMs: 5000 }] });
  const elapsed = engine.elapsed;
  stale(engine.lastTime + 800);
  assert.equal(engine.elapsed, elapsed);
  assert.equal(frames.size, 1);
  engine.destroy(); assert.equal(frames.size, 0);
});
test('quadro atrasado monta apenas a cena de destino', () => {
  const { engine, advance } = clockEngine();
  let mounts = 0; engine.mount = () => mounts++;
  advance(2700); assert.equal(mounts, 1); engine.destroy();
});
