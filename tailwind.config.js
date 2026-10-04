/** IMDR brand tokens, taken from the logo: navy #0A1931, cyan-blue #0075C9, gold #F5A623. */
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./resources/views/**/*.blade.php', './resources/js/**/*.jsx'],
    theme: {
        extend: {
            colors: {
                navy: {
                    DEFAULT: '#0A1931',
                    50: '#F2F5FA', 100: '#E3E9F2', 200: '#C7D2E3', 300: '#97A9C7', 400: '#61799E',
                    500: '#3C5479', 600: '#26405F', 700: '#172E4C', 800: '#0F2340', 900: '#0A1931',
                },
                brand: {
                    DEFAULT: '#0075C9',
                    50: '#E8F4FD', 100: '#CDE6F8', 200: '#9ACDF1', 500: '#0075C9', 600: '#0065AF', 700: '#005391',
                },
                gold: {
                    DEFAULT: '#F5A623',
                    50: '#FEF6E6', 100: '#FDE8BF', 400: '#F8B94D', 500: '#F5A623', 600: '#D98C0C', 700: '#A96A05',
                },
                paper: '#F5F7FB',
            },
            fontFamily: {
                display: ['Archivo', 'Noto Sans Sinhala', 'system-ui', 'sans-serif'],
                sans: ['Instrument Sans', 'Noto Sans Sinhala', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                lift: '0 1px 2px rgba(10,25,49,.06), 0 6px 18px -8px rgba(10,25,49,.18)',
            },
        },
    },
    plugins: [],
};
