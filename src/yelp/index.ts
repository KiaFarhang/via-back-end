import * as rp from "request-promise-native";
import {Location, YelpSearchResponse } from "../types";

export const buildSearchQueryString = (searchTerm: string, location?: Location, address?: string): string => {

    return `https://api.yelp.com/v3/businesses/search?term=${searchTerm}&${location ?
    `latitude=${location.latitude}&longitude=${location.longitude}` :
    `location=${encodeURIComponent(address as string)}`}`;
};

export const searchRestaurants = async (searchTerm: string, location: Location,
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
