import * as rp from "request-promise-native";
import { Business, Location, Trip, UserData, YelpBusiness, YelpSearchResponse } from "../types";
import { calculateTimeNeeded, generateRangeFromDollarSigns } from "../util";
interface HasPriceAndDistance {
    price: string;
    distance: number;
}

export const buildSearchQueryString = (searchTerm: string, location?: Location, address?: string): string => {

    return `https://api.yelp.com/v3/businesses/search?term=${searchTerm}&${location ?
        `latitude=${location.latitude}&longitude=${location.longitude}` :
        `location=${encodeURIComponent(address as string)}`}`;
};

export const searchBusinesses = async (
    searchTerm: string, location: Location,
    address?: string): Promise<YelpSearchResponse> => {
    const parameters = {
        uri: buildSearchQueryString(searchTerm, location, address),
        headers: {
            Authorization: `Bearer ${process.env.YELP_KEY}`,
        },
        json: true,
    };
    try {
        const response = await rp(parameters);
        return response;
    } catch (error) {
        throw new Error(error);
    }
};

export const sortByPriceAndDistance = (objects: HasPriceAndDistance[]): HasPriceAndDistance[] => {

    const separateArraysByPrice: HasPriceAndDistance[][] = [];

    separateArraysByPrice.push(objects.filter((object) => object.price === "$"));
    separateArraysByPrice.push(objects.filter((object) => object.price === "$$"));
    separateArraysByPrice.push(objects.filter((object) => object.price === "$$$"));
    separateArraysByPrice.push(objects.filter((object) => object.price === "$$$$"));

    separateArraysByPrice.forEach((array: HasPriceAndDistance[]) => {
        array.sort((objectA, objectB) => objectA.distance - objectB.distance);
    });

    return separateArraysByPrice.reduce((a, b) => a.concat(b), []);
};

export const removeExpensiveAndClosedBusinesses = (businesses: YelpBusiness[], money: number): YelpBusiness[] => {
    return businesses.filter((business) => {
        if (!business.is_closed) {
            const maxDollarSigns = generateMaxDollarSignsFromMoney(money);
            return maxDollarSigns.includes(business.price);
        } else {
            return false;
        }
    });
};

export const generateMaxDollarSignsFromMoney = (money: number): string => {
    // Yelp gives guidance as to how much a dollar sign is worth
    // https://www.quora.com/How-are-dollar-signs-calculated-on-Yelp-and-who-calculates-them
    if (money > 61) {
        return "$$$$";
    } else if (money > 31) {
        return "$$$";
    } else if (money > 11) {
        return "$$";
    } else {
        return "$";
    }
};

export const fetchTrips = async (data: UserData): Promise<Trip[]> => {
    try {
        const yelpResponse = await searchBusinesses(data.searchTerm, data.location, data.address);
        const { businesses } = yelpResponse;
        const sortedBusinesses = sortByPriceAndDistance
            (removeExpensiveAndClosedBusinesses(businesses, data.money)) as YelpBusiness[];
        const trips: Trip[] = sortedBusinesses.map((yBusiness: YelpBusiness) => {
            const business: Business = {
                name: yBusiness.name,
                imgURL: yBusiness.image_url,
                isClosed: yBusiness.is_closed,
                cost: yBusiness.price,
                phoneNumber: yBusiness.phone,
                address: `${yBusiness.location.address1} ${yBusiness.location.city}, ${yBusiness.location.zip_code}`,
                yelpURL: yBusiness.url,
                coordinates: yBusiness.coordinates,
                rating: yBusiness.rating,
            };
            console.log(yBusiness.categories);
            return {
                business,
                minutes: calculateTimeNeeded(yBusiness.categories[0].alias, business.cost),
                cost: generateRangeFromDollarSigns(business.cost),
            };
        });

        return trips;

    } catch (error) {
        throw new Error(error);
    }
};
