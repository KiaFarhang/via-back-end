export interface UserData{
    location: Location;
    startTime: Date;
    endTime: Date;
    money: number;
    searchTerm: string;
}

export interface Trip{
    business: Business;
    minutes: number;
    cost: number;
}

export interface Business{
    name: string;
    imgURL: string;
    category: string;
}

export interface Location{
    latitude: number;
    longitude: number;
}