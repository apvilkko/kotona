import config from "../config";
import fi from "./translations/fi.json";

const TRANSLATIONS = { data: fi };

// TODO dynamic import works but parcel doesn't serve correct content type
TRANSLATIONS.data = config.locale === "fi" ? fi : {};

export default id => TRANSLATIONS.data[id] || id;
