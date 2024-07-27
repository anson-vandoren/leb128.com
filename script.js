// Convert decimal to LEB128
function decimalToLEB128(decimal) {
    if (decimal < 0) throw new Error("Negative numbers are not supported");
    if (!Number.isInteger(decimal)) {
        console.warn("Non-integer input truncated to integer");
        decimal = Math.trunc(decimal);
    }
    
    let bytes = [];
    do {
        let byte = decimal & 0x7F;
        decimal >>= 7;
        if (decimal !== 0) byte |= 0x80;
        bytes.push(byte);
    } while (decimal !== 0);
    
    return bytes;
}

// Convert LEB128 to decimal
function LEB128ToDecimal(bytes) {
    let result = 0;
    let shift = 0;
    for (let i = 0; i < bytes.length; i++) {
        result |= (bytes[i] & 0x7F) << shift;
        if ((bytes[i] & 0x80) === 0) break;
        shift += 7;
    }
    return result;
}

// Format LEB128 bytes according to selected output format
function formatLEB128(bytes, format) {
    switch (format) {
        case 'hex-space':
            return bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
        case 'dec-comma':
            return bytes.join(',');
        case 'hex-0x-comma':
            return bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(',');
        case 'hex-string':
            return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
        default:
            throw new Error("Invalid format");
    }
}

// Parse LEB128 input
function parseLEB128Input(input) {
    // Remove all whitespace and split by commas
    let parts = input.replace(/\s/g, '').split(',');
    let bytes = [];
    
    for (let part of parts) {
        if (part.startsWith('0x')) {
            bytes.push(parseInt(part.slice(2), 16));
        } else if (/^[0-9]+$/.test(part)) {
            bytes.push(parseInt(part, 10));
        } else if (/^[0-9a-fA-F]+$/.test(part)) {
            // If it's a continuous hex string, split it into bytes
            for (let i = 0; i < part.length; i += 2) {
                bytes.push(parseInt(part.slice(i, i + 2), 16));
            }
        } else {
            throw new Error("Invalid LEB128 input");
        }
    }
    
    return bytes;
}

// DOM elements
const decimalInput = document.getElementById('decimal-input');
const leb128Input = document.getElementById('leb128-input');
const outputFormat = document.getElementById('output-format');
const errorMessage = document.getElementById('error-message');
const decimalCopyBtn = document.getElementById('decimal-copy');
const leb128CopyBtn = document.getElementById('leb128-copy');

// Update LEB128 when decimal input changes
decimalInput.addEventListener('input', () => {
    try {
        errorMessage.classList.add('hidden');
        const decimal = parseInt(decimalInput.value, 10);
        if (isNaN(decimal)) {
            leb128Input.value = '';
            return;
        }
        const leb128 = decimalToLEB128(decimal);
        leb128Input.value = formatLEB128(leb128, outputFormat.value);
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    }
});

// Update decimal when LEB128 input changes
leb128Input.addEventListener('input', () => {
    try {
        errorMessage.classList.add('hidden');
        const leb128 = parseLEB128Input(leb128Input.value);
        const decimal = LEB128ToDecimal(leb128);
        decimalInput.value = decimal;
        // Update LEB128 input to match the current format
        leb128Input.value = formatLEB128(leb128, outputFormat.value);
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    }
});

// Update LEB128 format when output format changes
outputFormat.addEventListener('change', () => {
    if (leb128Input.value) {
        const leb128 = parseLEB128Input(leb128Input.value);
        leb128Input.value = formatLEB128(leb128, outputFormat.value);
    }
});

// Copy button functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard');
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
}

decimalCopyBtn.addEventListener('click', () => copyToClipboard(decimalInput.value));
leb128CopyBtn.addEventListener('click', () => copyToClipboard(leb128Input.value));

// Save output format preference to local storage
outputFormat.addEventListener('change', () => {
    localStorage.setItem('leb128OutputFormat', outputFormat.value);
});

// Load output format preference from local storage
document.addEventListener('DOMContentLoaded', () => {
    const savedFormat = localStorage.getItem('leb128OutputFormat');
    if (savedFormat) {
        outputFormat.value = savedFormat;
    }
});
