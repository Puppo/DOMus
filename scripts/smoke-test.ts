// Smoke test for the store + WebMCP handler surface. Run with:
//   npx tsx scripts/smoke-test.ts   (or)   node --import tsx scripts/smoke-test.ts
//
// We bypass rendering entirely and exercise every store action the WebMCP
// handlers call, then read back the state. This is the closest thing to an
// agent making tool calls without a browser.

import { useRoomStore, undo, redo, clearHistory } from '../src/store/useRoomStore';

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error('  FAIL:', msg);
    process.exit(1);
  } else {
    console.log('  ok  :', msg);
  }
}

console.log('1. Reset to clean state');
useRoomStore.getState().reset();
clearHistory();

console.log('\n2. set_room_dimensions(5×6×3)');
useRoomStore.getState().setRoom({ width: 5, length: 6, height: 3 });
let s = useRoomStore.getState();
assert(s.room.width === 5 && s.room.length === 6 && s.room.height === 3, 'room dimensions applied');

console.log('\n3. set_room_colors');
useRoomStore.getState().setRoom({ wallColor: '#F5F1EA', floorColor: '#C9A77A' });
assert(useRoomStore.getState().room.wallColor === '#F5F1EA', 'wallColor applied');

console.log('\n4. add_furniture bed + nightstand + lamp');
const bedId = useRoomStore.getState().addFurniture('bed', { position: { x: 2.5, y: 0, z: 0.5 } });
const nsId  = useRoomStore.getState().addFurniture('nightstand', { position: { x: 1.4, y: 0, z: 0.5 } });
const lampId = useRoomStore.getState().addFurniture('lamp', { position: { x: 3.6, y: 0, z: 0.5 } });
s = useRoomStore.getState();
assert(s.items.length === 3, 'three items present');
assert(s.selectedId === lampId, 'selectedId points to the last-added item');

console.log('\n5. move_furniture bed');
useRoomStore.getState().moveFurniture(bedId, { x: 2.5, y: 0, z: 1.0 });
const bed = useRoomStore.getState().items.find((i) => i.id === bedId)!;
assert(bed.position.z === 1.0, 'bed Z = 1.0');

console.log('\n6. clamp check: move lamp out of bounds');
useRoomStore.getState().moveFurniture(lampId, { x: 99, y: 0, z: 99 });
const lamp = useRoomStore.getState().items.find((i) => i.id === lampId)!;
assert(lamp.position.x <= 5, 'lamp X clamped inside 5m width');
assert(lamp.position.z <= 6, 'lamp Z clamped inside 6m length');

console.log('\n7. rotate bed 90°');
useRoomStore.getState().rotateFurniture(bedId, Math.PI / 2);
const bed2 = useRoomStore.getState().items.find((i) => i.id === bedId)!;
assert(Math.abs(bed2.rotationY - Math.PI / 2) < 1e-6, 'bed rotation = PI/2');

console.log('\n8. set_furniture_color');
useRoomStore.getState().setFurnitureColor(bedId, 'primary', '#2E3440');
const bed3 = useRoomStore.getState().items.find((i) => i.id === bedId)!;
assert(bed3.colors.primary === '#2E3440', 'bed primary = #2E3440');

console.log('\n9. set_furniture_scale');
useRoomStore.getState().setFurnitureScale(bedId, { x: 1.2 });
const bed4 = useRoomStore.getState().items.find((i) => i.id === bedId)!;
assert(Math.abs(bed4.scale.x - 1.2) < 1e-6, 'bed scale.x = 1.2');

console.log('\n10. remove_furniture');
useRoomStore.getState().removeFurniture(nsId);
assert(useRoomStore.getState().items.length === 2, 'two items remain after remove');

console.log('\n11. shrink room; items re-clamp');
useRoomStore.getState().setRoom({ width: 2, length: 2, height: 2 });
const lamp2 = useRoomStore.getState().items.find((i) => i.id === lampId)!;
assert(lamp2.position.x <= 2, 'lamp X re-clamped after room shrink');

console.log('\n12. undo / redo');
const beforeUndo = JSON.stringify(useRoomStore.getState().items);
undo();
console.log('  undo state changes length:', useRoomStore.getState().items.length, 'vs before', JSON.parse(beforeUndo).length);
redo();
console.log('  redo state changes length:', useRoomStore.getState().items.length);

console.log('\nALL CHECKS PASSED');
