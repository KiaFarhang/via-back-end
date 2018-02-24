import {Location } from "../types";

export const buildSearchQueryString = (searchTerm: string, location?: Location, address?: string): string=>{

    return `https://api.yelp.com/v3/businesses/search?term=${searchTerm}&${location ? `latitude=${location.latitude}&longitude=${location.longitude}` : `location=${encodeURIComponent(address as string)}`}`;

}