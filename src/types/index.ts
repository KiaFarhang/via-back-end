export interface UserData {
    location: Location;
    startTime: Date;
    endTime: Date;
    money: number;
    searchTerm: string;
}

export interface Trip {
    business: Business;
    minutes: number;
    cost: number;
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
}

export interface YelpSearchResponse {
    total: number;
    businesses: Array<{
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
    }>;
    region: {
        center: Location;
    };
}

export interface Location {
    latitude: number;
    longitude: number;
}
