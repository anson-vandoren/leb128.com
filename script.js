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
    // Remove all whitespace
    input = input.replace(/\s/g, '');
    
    let bytes = [];
    
    // Check if it's a comma-separated list
    if (input.includes(',')) {
        let parts = input.split(',');
        for (let part of parts) {
            if (part.startsWith('0x')) {
                bytes.push(parseInt(part.slice(2), 16));
            } else if (/^[0-9]+$/.test(part)) {
                bytes.push(parseInt(part, 10));
            } else if (/^[0-9a-fA-F]+$/.test(part)) {
                bytes.push(parseInt(part, 16));
            } else {
                throw new Error("Invalid LEB128 input");
            }
        }
    } else {
        // Treat as a continuous hex string
        for (let i = 0; i < input.length; i += 2) {
            if (i + 1 < input.length) {
                bytes.push(parseInt(input.slice(i, i + 2), 16));
            } else {
                bytes.push(parseInt(input.slice(i), 16));
            }
        }
    }
    
    return bytes;
}

// DOM elements
const decimalInput = document.getElementById('decimal-input');
const leb128Input = document.getElementById('leb128-input');
const outputFormat = document.getElementById('output-format');
const errorMessage = document.getElementById('error-message');
const decimalCopyLink = document.getElementById('decimal-copy');
const leb128CopyLink = document.getElementById('leb128-copy');

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
leb128Input.addEventListener('input', (e) => {
    try {
        errorMessage.classList.add('hidden');
        let input = e.target.value.replace(/[^0-9a-fA-F,]/g, ''); // Allow only hex digits and commas
        
        if (input.trim() === '') {
            decimalInput.value = '';
            return;
        }

        // If the last character is a single hex digit, pad it with a leading zero
        if (!/,$/.test(input) && input.length % 2 !== 0) {
            input = input.slice(0, -1) + '0' + input.slice(-1);
        }

        const leb128 = parseLEB128Input(input);
        const decimal = LEB128ToDecimal(leb128);
        decimalInput.value = decimal;

        // Only format the input if it's not actively being edited
        if (e.inputType === 'insertFromPaste' || e.target.value === input) {
            e.target.value = formatLEB128(leb128, outputFormat.value);
        }
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

// Copy functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard');
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
}

decimalCopyLink.addEventListener('click', (e) => {
    e.preventDefault();
    copyToClipboard(decimalInput.value);
});

leb128CopyLink.addEventListener('click', (e) => {
    e.preventDefault();
    copyToClipboard(leb128Input.value);
});

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
