// js/slipk4.js

// ฟังก์ชันเพื่อโหลดฟอนต์ (แบบกันพัง - ถ้าตัวไหนโหลดไม่ได้ให้ข้ามไปโหลดตัวอื่นต่อ)
function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)')
    ];

    // ใช้ Promise.allSettled เพื่อโหลดแยกกัน ตัวไหนพังก็โชว์ Error ใน Console แต่ตัวอื่นรอด
    return Promise.allSettled(fonts.map(font => font.load())).then(function(results) {
        results.forEach(function(result, index) {
            if (result.status === 'fulfilled') {
                document.fonts.add(result.value);
            } else {
                console.error('❌ หาไฟล์ฟอนต์นี้ไม่เจอ (เช็คชื่อไฟล์/Path):', fonts[index].family);
            }
        });
    });
}

// เรียกใช้ฟังก์ชันเพื่อโหลดฟอนต์หลังจากหน้าเว็บถูกโหลด
window.onload = function() {
    setCurrentDateTime();
    // โหลดฟอนต์และอัปเดตการแสดงผล
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    
    const formattedDateTime = localDateTime.substring(0, 16); 
    document.getElementById('datetime').value = formattedDateTime;
    document.getElementById('datetime1').value = formattedDateTime;

    // ตั้งค่าเวลาหน้าจอ (บวก 1 นาที)
    const oneMinuteLater = new Date(now.getTime() + 60000); 
    const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
    const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
    const formattedTimePlusOne = `${hours}:${minutes}`;
    document.getElementById('datetime_plus_one').value = formattedTimePlusOne;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function formatDateWithDay(date) {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const dayName = days[new Date(date).getDay()];
    const day = new Date(date).getDate();
    const month = months[new Date(date).getMonth()];

    return `${dayName}ที่ ${day} ${month}`;
}

function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = parseInt(formattedDate.split(' ')[0]); 
    const month = months[new Date(date).getMonth()];
    const year = formattedDate.split(' ')[2];
    return `${day} ${month} ${year}`;
}

let qrCodeImage = null;
let powerSavingMode = false;

function handlePaste(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    qrCodeImage = img;
                    updateDisplay();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
        }
    }
}

function updateDisplay() {
    const backgroundSelect = document.getElementById('backgroundSelect')?.value || '';
    const datetime = document.getElementById('datetime')?.value || '-';
    const datetime1 = document.getElementById('datetime1')?.value || '-';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const money01 = document.getElementById('money01')?.value || '-';
    const money02 = document.getElementById('money02')?.value || '-';
    const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';

    const formattedDate = formatDate(datetime.substring(0, 10)); 
    const formattedDateWithDay = formatDateWithDay(datetime.substring(0, 10)); 
    const formattedTime = datetime.substring(11, 16); 
    const formattedTime1 = datetime1.substring(11, 16); 
    const formattedTimePlusOne = datetimePlusOne; 

    // คำนวณเวลา ยอดที่ 1
    let timeDifference = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime}:00Z`)) / 60000);
    let timeMessage = "";
    if (timeDifference >= 60) {
        let hours = Math.floor(timeDifference / 60);
        timeMessage = `${hours} ชั่วโมงที่แล้ว`;
    } else if (timeDifference > 1) {
        timeMessage = `${timeDifference} นาทีที่แล้ว`;
    } else if (timeDifference === 1) {
        timeMessage = "1 นาทีที่แล้ว";
    } else {
        timeMessage = "ตอนนี้";
    }

    // คำนวณเวลา ยอดที่ 2
    let timeDifference2 = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime1}:00Z`)) / 60000);
    let timeMessage2 = "";
    if (timeDifference2 >= 60) {
        let hours = Math.floor(timeDifference2 / 60);
        timeMessage2 = `${hours} ชั่วโมงที่แล้ว`;
    } else if (timeDifference2 > 1) {
        timeMessage2 = `${timeDifference2} นาทีที่แล้ว`;
    } else if (timeDifference2 === 1) {
        timeMessage2 = "1 นาทีที่แล้ว";
    } else {
        timeMessage2 = "ตอนนี้";
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const backgroundImage = new Image();
    backgroundImage.src = backgroundSelect;
    
    backgroundImage.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        // วันที่หน้าจอ
        drawText(ctx, `   ${formattedDateWithDay}   `, 308, 167.8, 33.50, 'SFThonburiSemiBold', '#ffffff', 'center', 24, 3, 0, 0, 800, 0);
        // เวลาหน้าจอ
        drawText(ctx, `${formattedTimePlusOne}`, 295, 298.8, 138.50, 'SFThonburiSemiBold', '#ffffff', 'center', 1.5, 3, 0, 0, 800, -7);

        // ข้อมูลเงินเข้า 1
        drawText(ctx, `รายการเงินเข้า`, 107.8, 451.8, 21.50, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${timeMessage}`, 547.5, 451.8, 18.50, 'SFThonburiRegular', '#6f8590', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `บัญชี ${senderaccount1} จำนวนเงิน ${money01} บาท วันที่ ${formattedDate} ${formattedTime} น.<br>`, 107.8, 481.8, 20.50, 'SFThonburiRegular', '#000000', 'left', 31.5, 3, 0, 0, 420, 0);

        // ข้อมูลเงินเข้า 2
        drawText(ctx, `รายการเงินเข้า`, 107.8, 588, 21.50, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${timeMessage2}`, 547.5, 588, 18.50, 'SFThonburiRegular', '#6f8590', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `บัญชี ${senderaccount1} จำนวนเงิน ${money02} บาท วันที่ ${formattedDate} ${formattedTime1} น.<br>`, 107.8, 617.8, 20.50, 'SFThonburiRegular', '#000000', 'left', 31.5, 3, 0, 0, 420, 0);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); 
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };
}

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
        const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);

        let lines = [];
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine + word;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine.trimStart()); 
        }

        lines.forEach((line, index) => {
            let currentX = x;

            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) {
                return;
            }
        });

        // ✅ แก้บั๊กตรงนี้: บวก Y เพิ่มเมื่อเจอ <br>
        currentY += lineHeight; 
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const characters = [...segmenter.segment(text)].map(segment => segment.segment);
    let currentPosition = x;

    characters.forEach((char, index) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}

function drawBattery(ctx, batteryLevel, powerSavingMode) {
    ctx.lineWidth = 2; 
    ctx.strokeStyle = '#9b9b9b'; 
    ctx.fillStyle = '#ffffff'; 

    let batteryColor = '#ffffff'; 
    if (batteryLevel <= 20) {
        batteryColor = '#ff0000'; 
    } else if (powerSavingMode) {
        batteryColor = '#fccd0e'; 
    }

    const fillWidth = (batteryLevel / 100) * 31; 
    const x = 511.5;
    const y = 32.4;
    const height = 13.8;
    const radius = 4; 

    ctx.fillStyle = batteryColor; 

    ctx.beginPath(); 
    ctx.moveTo(x, y + radius); 
    ctx.lineTo(x, y + height - radius); 
    ctx.arcTo(x, y + height, x + radius, y + height, radius); 
    ctx.lineTo(x + fillWidth - radius, y + height); 
    ctx.arcTo(x + fillWidth, y + height, x + fillWidth, y + height - radius, radius); 
    ctx.lineTo(x + fillWidth, y + radius); 
    ctx.arcTo(x + fillWidth, y, x + fillWidth - radius, y, radius); 
    ctx.lineTo(x + radius, y); 
    ctx.arcTo(x, y, x, y + radius, radius); 
    ctx.closePath(); 
    ctx.fill(); 
}

function togglePowerSavingMode() {
    powerSavingMode = !powerSavingMode;
    const powerSavingButton = document.getElementById('powerSavingMode');
    if (powerSavingButton) powerSavingButton.classList.toggle('active', powerSavingMode);
    updateDisplay();
}

function updateBatteryDisplay() {
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const levelText = document.getElementById('battery-level');
    if (levelText) levelText.innerText = batteryLevel;
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_kbank3.png';
    link.click();
}

// ผูกปุ่มสร้าง (ถ้ามี)
document.getElementById('generate')?.addEventListener('click', updateDisplay);
