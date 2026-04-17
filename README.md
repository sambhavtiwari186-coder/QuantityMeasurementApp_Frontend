# Quantity Measurement App - Frontend

A modern Angular application for unit conversion, comparison, and arithmetic operations across various measurement types.

## Features

- 🔄 **Unit Conversion**: Convert between different units (length, weight, volume, temperature, etc.)
- ⚖️ **Value Comparison**: Compare quantities across different units
- 🧮 **Arithmetic Operations**: Add, subtract, multiply, and divide quantities
- 📊 **History Tracking**: View all your past calculations
- 🔐 **User Authentication**: Secure login and registration
- 🎨 **Modern UI**: Beautiful glassmorphism design with smooth animations

## Tech Stack

- **Framework**: Angular 19
- **Styling**: Custom CSS with glassmorphism effects
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router with guards
- **Deployment**: Vercel

## Backend Integration

This frontend connects to a backend API deployed at:
`https://quantitymeasurmentapp-qyyx.onrender.com/api`

### API Endpoints Used

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Measurement Operations
- `POST /api/measurement/convert` - Convert between units
- `POST /api/measurement/compare` - Compare two quantities
- `POST /api/measurement/add` - Add two quantities
- `POST /api/measurement/subtract` - Subtract quantities
- `POST /api/measurement/multiply` - Multiply quantities
- `POST /api/measurement/divide` - Divide quantities
- `GET /api/measurement/history` - Get calculation history

## Supported Units

### Length
inch, feet, yard, centimeter, kilometer, mile

### Volume
gallon, litre, ml, millilitre

### Weight
kg, kilogram, gram, milligram, tonne, pound

### Temperature
celsius, fahrenheit, kelvin

### Time
second, minute, hour, day, week

### Area
squareinch, squarefoot, squaremeter, acre, hectare

### Speed
kmph, mph, mps, knot

### Energy
joule, calorie, kilocalorie, kilojoule, megajoule, gigajoule, watthour

### Pressure
pascal, bar, psi, kilopascal, atmosphere, torr

### Angle
degree, radian, gradian

### Power
watt, kilowatt, megawatt, horsepower

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Deployment
The app is configured for deployment on Vercel with the `vercel.json` configuration file.

## Live Demo

- **Frontend**: https://quantity-measurement-app-frontend-iota.vercel.app
- **Backend**: https://quantitymeasurmentapp-qyyx.onrender.com

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth.component.ts          # Login/Register UI
│   │   └── dashboard.component.ts     # Main application UI
│   ├── services/
│   │   ├── auth.service.ts            # Authentication service
│   │   └── measurement.service.ts     # Measurement operations service
│   └── environments/
│       ├── environment.ts             # Development config
│       └── environment.prod.ts        # Production config
├── styles.css                         # Global styles
├── main.ts                            # Application bootstrap
└── index.html                         # Main HTML template
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
