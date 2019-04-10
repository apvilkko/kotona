import Cloud from "./climacons/Cloud.svg";
import CloudRain from "./climacons/Cloud-Rain.svg";
import CloudSnowAlt from "./climacons/Cloud-Snow-Alt.svg";
import CloudSnow from "./climacons/Cloud-Snow.svg";
import CloudFogAlt from "./climacons/Cloud-Fog-Alt.svg";
import CloudSun from "./climacons/Cloud-Sun.svg";
import CloudMoon from "./climacons/Cloud-Moon.svg";
import Moon from "./climacons/Moon.svg";
import Sun from "./climacons/Sun.svg";
import Wind from "./climacons/Wind.svg";
import Thermometer from "./climacons/Thermometer.svg";

// Darksky - climacons mapping
const ICONS = {
  "clear-day": Sun,
  "clear-night": Moon,
  rain: CloudRain,
  snow: CloudSnowAlt,
  sleet: CloudSnow,
  wind: Wind,
  fog: CloudFogAlt,
  cloudy: Cloud,
  "partly-cloudy-day": CloudSun,
  "partly-cloudy-night": CloudMoon
};

export default icon => ICONS[icon] || Thermometer;
