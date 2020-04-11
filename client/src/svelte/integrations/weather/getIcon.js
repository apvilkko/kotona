import Cloud from "./climacons/Cloud.svg";
import CloudDrizzle from "./climacons/Cloud-Drizzle.svg";
import CloudRainSun from "./climacons/Cloud-Rain-Sun.svg";
import CloudRainMoon from "./climacons/Cloud-Rain-Moon.svg";
import CloudRain from "./climacons/Cloud-Rain.svg";
import CloudSnowAlt from "./climacons/Cloud-Snow-Alt.svg";
import CloudFogAlt from "./climacons/Cloud-Fog-Alt.svg";
import CloudSun from "./climacons/Cloud-Sun.svg";
import CloudMoon from "./climacons/Cloud-Moon.svg";
import Moon from "./climacons/Moon.svg";
import Sun from "./climacons/Sun.svg";
import Sunset from "./climacons/Sunset.svg";
import SunLow from "./climacons/Sun-Low.svg";
import Wind from "./climacons/Wind.svg";
import Shades from "./climacons/Shades.svg";
import Thermometer from "./climacons/Thermometer.svg";
import ThermometerZero from "./climacons/Thermometer-Zero.svg";
import CloudLightningSun from "./climacons/Cloud-Lightning-Sun.svg";
import CloudLightningMoon from "./climacons/Cloud-Lightning-Moon.svg";
import North from "./climacons/Compass-North.svg";
import South from "./climacons/Compass-South.svg";
import East from "./climacons/Compass-East.svg";
import West from "./climacons/Compass-West.svg";

const ICONS = {
  "01d": Sun,
  "01n": Moon,
  "02d": CloudSun,
  "02n": CloudMoon,
  "03d": Cloud,
  "03n": Cloud,
  "04d": Cloud,
  "04n": Cloud,
  "09d": CloudDrizzle,
  "09n": CloudDrizzle,
  "10d": CloudRainSun,
  "10n": CloudRainMoon,
  "11d": CloudLightningSun,
  "11n": CloudLightningMoon,
  "13d": CloudSnowAlt,
  "13n": CloudSnowAlt,
  "50d": CloudFogAlt,
  "50n": CloudFogAlt,
  wind: Wind,
  rain: CloudRain,
  snow: CloudSnowAlt,
  north: North,
  south: South,
  east: East,
  west: West,
  cloud: Cloud,
  shades: Shades,
  sunrise: SunLow,
  sunset: Sunset,
  thermometerZero: ThermometerZero
};

export default icon => ICONS[icon] || Thermometer;
