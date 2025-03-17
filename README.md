# Warhammer 40K Army List Comparison Tool

A web application for comparing two Warhammer 40K army lists side by side. This tool allows players to upload their army lists in HTML format and view detailed information about each unit, including profiles, weapons, abilities, and rules.

## Features

- Upload and parse Warhammer 40K army lists in HTML format
- Side-by-side comparison of two army lists
- Detailed unit cards with complete stat profiles
- Search functionality to find specific units, weapons, or abilities
- Highlight units for easier comparison
- Responsive design for both desktop and mobile devices

## Tech Stack

- Next.js 14 (React framework)
- TypeScript for type safety
- Tailwind CSS for styling
- HTML parsing logic for army list data

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/warhammer-army-comparison.git
cd warhammer-army-comparison
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. On the homepage, you'll find two upload areas for your army lists
2. Upload HTML files or paste HTML content directly
3. Enter names for each army to identify them
4. Once both lists are loaded, they will be displayed side by side
5. Use the search bar to find specific units, weapons, or abilities
6. Click on unit cards to highlight them for easier comparison

## Data Format

The application expects Warhammer 40K army list data in an HTML format with specific class names and structure. The HTML should contain:

- Units with class `.unit[type="card"]`
- Unit names in `.name`
- Unit costs in `.cost`
- Unit profiles, weapons, abilities in appropriate sections

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Games Workshop for creating Warhammer 40,000
- The Warhammer 40K community for their continued support
