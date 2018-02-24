import { assert } from "chai";
import * as dotenv from "dotenv";
import * as nock from "nock";
import * as sinon from "sinon";
import {YelpBusiness, YelpSearchResponse} from "../types";
import * as y from "./index";
import mockData from "./yelp-api-mock";

dotenv.config();

describe("Yelp", () => {
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
});
