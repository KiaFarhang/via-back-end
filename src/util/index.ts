import {YelpBusiness} from "../types";

export const generateRangeFromDollarSigns = (dollarSigns: string): string => {
    if (dollarSigns === '$$$$') {
        return "+$64";
    } else if (dollarSigns === '$$$') {
        return "$34-$63";
    } else if (dollarSigns === '$$') {
        return "$13-$33";
    } else {
        return "$3-$12";
    }
};

const categoryToTime = {
    'active': 120,
    'arts': 120,
    'coffee': 30,
    'food': 30,
    'pets': 90,
    'professional': 60,
    'restaurants': 45,
    'shopping': 90,
    'nightlife': 180,
    'pizza': 5,
    'italian': 5,
    'chinese': 5,
    'vietnamese': 5,
    'thai': 5,
    'mexican': 5,
    'french': 5,
    'german': 5,
    'belgian': 5,
    'mediterranean': 5,
    'greek': 5,
    'turkish': 5,
    'vegan': 5,
    'vegetarian': 5,
    'gluten_free': 5,
    'tradamerican': 5,
    'desserts': 5,
    'bakeries': 5,
    'salad': 5,
    'burgers': 5,
    'delis': 5,
    'icecream': 5,
    'musicvenues': 120,
    'grocery': 20,
    'drugstores': 20,
    'dptstores': 60,
    'shoes': 45,
    'theatre': 120,
    'sportsbars': 120,
    'cocktailbars': 120,
    'pubs': 120,
    'bars': 120,
    'breweries': 120,
    'lounges': 120,


}

export const calculateTimeNeeded = (alias: string, price: string): number => {
    let time = 0;
    console.log(alias);
    if (categoryToTime[alias]) {
        if (price === '$$$$') {
            time += 70;
        } else if (price === '$$$') {
            time += 45;
        } else if (price === '$$') {
            time += 30;
        } else {
            time += 20;
        }
        time += categoryToTime[alias];
        time += 30;
    }
    return time;

};
