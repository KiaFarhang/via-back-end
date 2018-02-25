export interface UserData {
    location: Location;
    address?: string;
    startTime: Date;
    endTime: Date;
    money: number;
    searchTerm: string;
}

export interface Trip {
    business: Business;
    minutes: number;
    cost: string;
}

export interface Business {
    name: string;
    imgURL: string;
    isClosed: boolean;
    cost: string;
    phoneNumber: string;
    address: string;
    yelpURL: string;
    coordinates: Location;
    rating: number;
}

export interface YelpSearchResponse {
    total: number;
    businesses: YelpBusiness[];
    region: {
        center: Location;
    };
}

export interface YelpBusiness {
    rating: number;
        price: string;
        phone: string;
        id: string;
        is_closed: boolean;
        categories: Array<{
            alias: string;
            title: string;
        }>;
        review_count: number;
        name: string;
        url: string;
        coordinates: Location;
        image_url: string;
        location: {
            city: string;
            country: string;
            address2: string;
            address3: string;
            state: string;
            address1: string;
            zip_code: string;
        };
        distance: number;
        transactions: string[];
}

export interface Location {
    latitude: number;
    longitude: number;
}
