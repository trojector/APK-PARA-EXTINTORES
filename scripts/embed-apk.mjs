import fs from 'fs';
const apkBuffer = fs.readFileSync('app/build/outputs/apk/debug/app-debug.apk');
const b64 = apkBuffer.toString('base64');
const tsContent = `// Auto-generated APK base64 data for 100% offline and direct download
export const APK_BASE64 = "${b64}";
export const APK_FILENAME = "app-debug.apk";
export const APK_SIZE_KB = ${Math.round(apkBuffer.length / 1024)};
`;
fs.writeFileSync('src/apkData.ts', tsContent);
console.log('Successfully embedded APK (' + apkBuffer.length + ' bytes) into src/apkData.ts');
