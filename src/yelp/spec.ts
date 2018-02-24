import { assert } from "chai";
import * as y from "./index";

describe("Yelp", ()=>{
    describe("buildSearchQueryString", ()=>{
        const searchTerm = "hamburgers";
        const location = {
            latitude: 29.4786,
            longitude: -98.4872
        };
        it("returns a string", ()=>{
            assert.isString(y.buildSearchQueryString(searchTerm, location));
        });
        it("the string starts with the Yelp API search endpoint", ()=>{
            const searchString = y.buildSearchQueryString(searchTerm, location);
            const endpoint = "https://api.yelp.com/v3/businesses/search";
            const shouldBeEndpoint = searchString.substr(0, endpoint.length);
            assert.strictEqual(endpoint, shouldBeEndpoint);
        });
        it("the string includes the search term passed in as the first query parameter", ()=>{
            const searchString = y.buildSearchQueryString(searchTerm, location);
            assert.include(searchString, `?term=${searchTerm}`);
        });
        it("if passed a location, the string includes latitude and longitude query parameters", ()=>{
            const searchString = y.buildSearchQueryString(searchTerm, location);
            assert.include(searchString, `&latitude=${location.latitude}`);
            assert.include(searchString, `&longitude=${location.longitude}`);
        });
        it("if passed a location, the string does NOT include a location query parameter", ()=>{
            const searchString = y.buildSearchQueryString(searchTerm, location);
            assert.notInclude(searchString, `&location=`);
        });
        it("if passed an address and no location, the string includes a location query parameter", ()=>{
            const searchString = y.buildSearchQueryString(searchTerm, undefined, "123 Fake Street");
            assert.include(searchString, `&location=${encodeURIComponent("123 Fake Street")}`);
        });
        it("if passed an address and no location, the string does NOT include latitude + longitude query parameters", ()=>{
            const searchString = y.buildSearchQueryString(searchTerm, undefined, "123 Fake Street");
            assert.notInclude(searchString, `&latitude=`);
            assert.notInclude(searchString, `&longitude=`);
        });
    });
});