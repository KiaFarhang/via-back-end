import { assert } from "chai";
import * as dotenv from "dotenv";
import * as nock from "nock";
import * as sinon from "sinon";
import {UserData, YelpBusiness, YelpSearchResponse} from "../types";
import * as y from "./index";
import mockData from "./yelp-api-mock";

dotenv.config();

describe("Yelp", () => {
    const fakeServer = nock("https://api.yelp.com", {
        reqheaders: {
            authorization: `Bearer ${process.env.YELP_KEY}`,
            host: "api.yelp.com",
            accept: "application/json",
        },
    })
    .persist()
    .get("/v3/businesses/search")
    .query({term: "hamburgers", latitude: 29.4786, longitude: -98.4872})
    .reply(200, mockData);

    after(() => {
        nock.cleanAll();
    });
    describe("buildSearchQueryString", () => {
        const searchTerm = "hamburgers";
        const location = {
            latitude: 29.4786,
            longitude: -98.4872,
        };
        it("returns a string", () => {
            assert.isString(y.buildSearchQueryString(searchTerm, location));
        });
        it("the string starts with the Yelp API search endpoint", () => {
            const searchString = y.buildSearchQueryString(searchTerm, location);
            const endpoint = "https://api.yelp.com/v3/businesses/search";
            const shouldBeEndpoint = searchString.substr(0, endpoint.length);
            assert.strictEqual(endpoint, shouldBeEndpoint);
        });
        it("the string includes the search term passed in as the first query parameter", () => {
            const searchString = y.buildSearchQueryString(searchTerm, location);
            assert.include(searchString, `?term=${searchTerm}`);
        });
        it("if passed a location, the string includes latitude and longitude query parameters", () => {
            const searchString = y.buildSearchQueryString(searchTerm, location);
            assert.include(searchString, `&latitude=${location.latitude}`);
            assert.include(searchString, `&longitude=${location.longitude}`);
        });
        it("if passed a location, the string does NOT include a location query parameter", () => {
            const searchString = y.buildSearchQueryString(searchTerm, location);
            assert.notInclude(searchString, `&location=`);
        });
        it("if passed an address and no location, the string includes a location query parameter", () => {
            const searchString = y.buildSearchQueryString(searchTerm, undefined, "123 Fake Street");
            assert.include(searchString, `&location=${encodeURIComponent("123 Fake Street")}`);
        });
        it("if passed an address + no location, the string does NOT include lat + long query parameters", () => {
            const searchString = y.buildSearchQueryString(searchTerm, undefined, "123 Fake Street");
            assert.notInclude(searchString, `&latitude=`);
            assert.notInclude(searchString, `&longitude=`);
        });
    });
    describe("searchBusinesses", () => {

        const requestParams = {
            location: {
                latitude: 29.4786,
                longitude: -98.4872,
            },
            searchTerm: "hamburgers",
        };

        describe("Successfully ping the Yelp API", () => {
            let response: YelpSearchResponse;
            let businesses: YelpBusiness[];
            before(async () => {
                response = await y.searchBusinesses(requestParams.searchTerm, requestParams.location);
                businesses = response.businesses;
            });

            it("returns an object", async () => {
                assert.isObject(response);
            });
            it("the object has a 'total' number property", () => {
                assert.property(response, "total");
                assert.isNumber(response.total);
            });
            it("the object has a 'businesses' property, which is an array of objects", () => {
                assert.property(response, "businesses");
                assert.isArray(response.businesses);
            });
            describe("businesses in the array", () => {
                it("the business has a 'rating' number property", () => {
                    businesses.forEach((business) => {
                        assert.property(business, "rating");
                        assert.isNumber(business.rating);
                    });
                });
                it("the business has a 'price' string property", () => {
                    businesses.forEach((business) => {
                        assert.property(business, "price");
                        assert.isString(business.price);
                    });
                });
            });
        });
        describe("Error pinging the Yelp API", () => {
            let searchStub: sinon.SinonStub;
            before(() => {
                searchStub = sinon.stub(y, "searchBusinesses");
                searchStub.throws();
            });
            after(() => {
                searchStub.restore();
            });
            it("throws an error", async () => {
                let err;
                try {
                    const response = await y.searchBusinesses(requestParams.searchTerm, requestParams.location);
                } catch (error) {
                    err = error;
                }

                assert.typeOf(err, "Error");
            });
        });
    });
    describe("removeExpensiveAndClosedBusinesses", () => {
        it("returns an array of objects", () => {
            const results = y.removeExpensiveAndClosedBusinesses(mockData.businesses, 20);
            assert.isArray(results);
        });
        it("any closed businesses are removed from the parameter array", () => {
            const onlyOneClosed = [
                {
                  rating: 4,
                  price: "$",
                  phone: "+14152520800",
                  id: "four-barrel-coffee-san-francisco",
                  is_closed: false,
                  categories: [
                    {
                      alias: "coffee",
                      title: "Coffee & Tea",
                    },
                  ],
                  review_count: 1738,
                  name: "Four Barrel Coffee",
                  url: "https://www.yelp.com/biz/four-barrel-coffee-san-francisco",
                  coordinates: {
                    latitude: 37.7670169511878,
                    longitude: -122.42184275,
                  },
                  image_url: "http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",
                  location: {
                    city: "San Francisco",
                    country: "US",
                    address2: "",
                    address3: "",
                    state: "CA",
                    address1: "375 Valencia St",
                    zip_code: "94103",
                  },
                  distance: 1604.23,
                  transactions: ["pickup", "delivery"],
                },
                {
                    rating: 4,
                    price: "$",
                    phone: "+14152520800",
                    id: "four-barrel-coffee-san-francisco",
                    is_closed: true,
                    categories: [
                      {
                        alias: "coffee",
                        title: "Coffee & Tea",
                      },
                    ],
                    review_count: 1738,
                    name: "Four Barrel Coffee",
                    url: "https://www.yelp.com/biz/four-barrel-coffee-san-francisco",
                    coordinates: {
                      latitude: 37.7670169511878,
                      longitude: -122.42184275,
                    },
                    image_url: "http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",
                    location: {
                      city: "San Francisco",
                      country: "US",
                      address2: "",
                      address3: "",
                      state: "CA",
                      address1: "375 Valencia St",
                      zip_code: "94103",
                    },
                    distance: 1604.23,
                    transactions: ["pickup", "delivery"],
                  },
                  {
                    rating: 4,
                    price: "$",
                    phone: "+14152520800",
                    id: "four-barrel-coffee-san-francisco",
                    is_closed: false,
                    categories: [
                      {
                        alias: "coffee",
                        title: "Coffee & Tea",
                      },
                    ],
                    review_count: 1738,
                    name: "Four Barrel Coffee",
                    url: "https://www.yelp.com/biz/four-barrel-coffee-san-francisco",
                    coordinates: {
                      latitude: 37.7670169511878,
                      longitude: -122.42184275,
                    },
                    image_url: "http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",
                    location: {
                      city: "San Francisco",
                      country: "US",
                      address2: "",
                      address3: "",
                      state: "CA",
                      address1: "375 Valencia St",
                      zip_code: "94103",
                    },
                    distance: 1604.23,
                    transactions: ["pickup", "delivery"],
                  },
              ];
            assert.lengthOf(y.removeExpensiveAndClosedBusinesses(onlyOneClosed, 10), 2);
        });
        it("any businesses over the dollar limit are removed from the parameter array", () => {
            const allOpenOneExpensive = [
                {
                  rating: 4,
                  price: "$",
                  phone: "+14152520800",
                  id: "four-barrel-coffee-san-francisco",
                  is_closed: false,
                  categories: [
                    {
                      alias: "coffee",
                      title: "Coffee & Tea",
                    },
                  ],
                  review_count: 1738,
                  name: "Four Barrel Coffee",
                  url: "https://www.yelp.com/biz/four-barrel-coffee-san-francisco",
                  coordinates: {
                    latitude: 37.7670169511878,
                    longitude: -122.42184275,
                  },
                  image_url: "http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",
                  location: {
                    city: "San Francisco",
                    country: "US",
                    address2: "",
                    address3: "",
                    state: "CA",
                    address1: "375 Valencia St",
                    zip_code: "94103",
                  },
                  distance: 1604.23,
                  transactions: ["pickup", "delivery"],
                },
                {
                    rating: 4,
                    price: "$",
                    phone: "+14152520800",
                    id: "four-barrel-coffee-san-francisco",
                    is_closed: false,
                    categories: [
                      {
                        alias: "coffee",
                        title: "Coffee & Tea",
                      },
                    ],
                    review_count: 1738,
                    name: "Four Barrel Coffee",
                    url: "https://www.yelp.com/biz/four-barrel-coffee-san-francisco",
                    coordinates: {
                      latitude: 37.7670169511878,
                      longitude: -122.42184275,
                    },
                    image_url: "http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",
                    location: {
                      city: "San Francisco",
                      country: "US",
                      address2: "",
                      address3: "",
                      state: "CA",
                      address1: "375 Valencia St",
                      zip_code: "94103",
                    },
                    distance: 1604.23,
                    transactions: ["pickup", "delivery"],
                  },
                  {
                    rating: 4,
                    price: "$$$$",
                    phone: "+14152520800",
                    id: "four-barrel-coffee-san-francisco",
                    is_closed: false,
                    categories: [
                      {
                        alias: "coffee",
                        title: "Coffee & Tea",
                      },
                    ],
                    review_count: 1738,
                    name: "Four Barrel Coffee",
                    url: "https://www.yelp.com/biz/four-barrel-coffee-san-francisco",
                    coordinates: {
                      latitude: 37.7670169511878,
                      longitude: -122.42184275,
                    },
                    image_url: "http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",
                    location: {
                      city: "San Francisco",
                      country: "US",
                      address2: "",
                      address3: "",
                      state: "CA",
                      address1: "375 Valencia St",
                      zip_code: "94103",
                    },
                    distance: 1604.23,
                    transactions: ["pickup", "delivery"],
                  },
              ];

            assert.lengthOf(y.removeExpensiveAndClosedBusinesses(allOpenOneExpensive, 10), 2);
        });
    });
    describe("sortByPriceAndDistance", () => {
        it("sorts the lowest-dollar-sign businesses to the front of the array", () => {
            const data = [
                {
                    price: "$$$",
                    distance: 100,
                },
                {
                    price: "$$",
                    distance: 4,
                },
                {
                    price: "$",
                    distance: 5,
                },
            ];
            const sorted = y.sortByPriceAndDistance(data);
            assert.strictEqual(sorted[0].distance, 5);
            assert.strictEqual(sorted[1].distance, 4);
            assert.strictEqual(sorted[2].distance, 100);
        });
        it("each group of dollar-sign-sorted businesses is sorted by distance", () => {
            const data = [
                {
                    price: "$$$",
                    distance: 1,
                },
                {
                    price: "$$",
                    distance: 4,
                },
                {
                    price: "$",
                    distance: 5,
                },
                {
                    price: "$",
                    distance: 3,
                },
                {
                    price: "$$",
                    distance: 2,
                },
            ];

            const sorted = y.sortByPriceAndDistance(data);
            assert.strictEqual(sorted[0].distance, 3);
            assert.strictEqual(sorted[1].distance, 5);
            assert.strictEqual(sorted[2].distance, 2);
            assert.strictEqual(sorted[3].distance, 4);
            assert.strictEqual(sorted[4].distance, 1);
        });
    });
    describe("fetchTrips", () => {
        describe("Successfully reach Yelp API", async () => {
            const parameters: UserData = {
                location: {
                    latitude: 29.4786,
                    longitude: -98.4872,
                },
                startTime: new Date(),
                endTime: new Date(),
                searchTerm: "hamburgers",
                money: 20,
            };

            const results = await y.fetchTrips(parameters);
            it("returns an array of objects", () => {
                assert.isArray(results);
                results.forEach((trip) => {
                    assert.isObject(trip);
                });
            });
            it("each object has a 'minutes' number property", () => {
                results.forEach((trip) => {
                    assert.property(trip, "minutes");
                    assert.isNumber(trip.minutes);
                });
            });
            it("each object has a 'cost' number property", () => {
                results.forEach((trip) => {
                    assert.property(trip, "cost");
                    assert.isNumber(trip.cost);
                });
            });
            it("each object has a 'business' property, which is an object", () => {
                results.forEach((trip) => {
                    assert.property(trip, "cost");
                    assert.isObject(trip.business);
                });
            });
        });
    });
});
