import {calcHeroRatings} from './calc-hero-ratings.js';
import {buildDatabase} from './build-data.js';
import {saveData} from './save-data.js';
import './build-data.js';

buildDatabase();
calcHeroRatings();
saveData();
