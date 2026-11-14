// บีบ/ย่อรูปก่อนอัปโหลด (client-side) เพื่อให้อัปไวขึ้น ไม่ชน upload limit
// คืน File ใหม่ (JPEG) ถ้าบีบได้; คืนไฟล์เดิมถ้าบีบไม่ได้ (fallback)

const MAX_DIM = 1600; // ขนาดด้านยาวสุด (px)
const QUALITY = 0.82; // คุณภาพ JPEG (0–1)
const SKIP_BELOW = 300 * 1024; // ไฟล์เล็กกว่า 300KB ไม่บีบ

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return file;
    if (file.size <= SKIP_BELOW) return file;

    try {
        const img = await loadImage(file);
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const blob = await canvasToBlob(canvas, 'image/jpeg', QUALITY);
        if (!blob) return file;

        const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        return new File([blob], name, { type: 'image/jpeg' });
    } catch (e) {
        // บีบไม่ได้ (เช่น HEIC ที่ browser ถอดรหัสไม่ได้) → ส่งไฟล์เดิม
        return file;
    }
}
