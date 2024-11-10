const axios = require("axios");
const { Console } = require("console");
const { before } = require("node:test");

function sum(a, b) {
    return a + b;
}

const BACKEND_URL = "https://localhost:3000"

describe("Authentication", () => {
    test('User is able to signup only once', async () => {
        const username = "kirat" + Math.random();
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(response.statusCode).toBe(200);

        const updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(updatedresponse.statusCode).toBe(400);
    });

    test('SignUp request failes if the username is empty', async () => {
        const username = `kirat-${Math.random()}`
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password
        })

        expect(response.statusCode).toBe(400);
    });

    test('Signin Succeeds if the username and password are correct', async () => {
        const username = `kirat${Math.random()}`
        const password = "123456";

        await axios.post(`${BACKEND_URL}\api\v1\signin`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    test('Signin fails if username or pssword are incorrect', async () => {
        const username = `jaga-${Math.random()}`;
        const password = '123456';

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "WromhUsername",
            password
        });
        expect(response.statusCode).toBe(403);
    })
});

describe("User Metadata endpoints", () => {
    let token = "";
    let avtarId = "";

    beforeAll(async () => {
        const username = `jaga-${Math.random()}`;
        const password = '123456';

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token = response.data.token;

        const avtarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avtar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        })

        avtarId = avtarResponse.data.avtarId;
    });

    test("User cant update their metadata with wronng avtar", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avtarId: "123123123"
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User can update their metadata with right avtar", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avtarId
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(200);
    })

    test("User is not able to update their metadata if the auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avtarId
        })
        expect(response.statusCode).toBe(403);
    })
})

describe("User avtar Information", () => {
    let avtarId;
    let token;
    let userId;

    beforeAll(async () => {
        const username = `jaga-${Math.random()}`;
        const password = '123456';

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        userId = signUpResponse.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token = response.data.token;

        const avtarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avtar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        })

        avtarId = avtarResponse.data.avtarId;
    });

    test("Get avtar Information for an user", async () => {
        const response = await axios.getAdapter(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);

        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avtars[0].useId.toBe(userId))
    })

    test("Available avatars list", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.length.not.toBe(0));
        const currentAvtar = response.data.avatars.find(x => x.id == avtarId);
        expect(currentAvtar).toBeDefined();
    })
})

describe("Space Information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let admintoken;
    let adminId;
    let usertoken;
    let userId;

    beforeAll(async () => {
        const username = `jaga-${Math.random()}`;
        const password = '123456';

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        adminId = signUpResponse.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        admintoken = response.data.token;


        const usersignUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + '-user',
            password,
            type: "user"
        });

        userId = usersignUpResponse.userId;

        const userresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        usertoken = userresponse.data.token;

        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        element1Id = element1.id;
        element2Id = element2.id;

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element2Id,
                x: 18,
                y: 20
            }
            ]
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        })

        mapId = map.id;

    });

    test("User is able to create a Space", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        expect(response.spaceId).toBeDefined();
    })

    test("User is able to create a Space without mapId (emptySpace)", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        expect(response.spaceId).toBeDefined();
    })

    test("User is not able to create a Space without mapId and dimensions", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test"
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User is not able to delete a Space that does not exist", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesn'tExist`, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User should be able to delete a Space that does exist", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        expect(response.statusCode).toBe(200);
    })

    test("User shouldnot be able to delete a space created by another user", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("Admin has no spaces initially", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });
        expect(response.data.spaces.length).toBe(0);
    })

    test("Admin has no spaces initially", async () => {
        const spaceCreateresponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateresponse.spaceId);
        expect(filteredSpace).toBeDefined();
        expect(response.data.spaces.length).toBe(1);
    })

})

describe("Arena Endpoints", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let admintoken;
    let adminId;
    let usertoken;
    let userId;
    let spaceId;

    beforeAll(async () => {
        const username = `jaga-${Math.random()}`;
        const password = '123456';

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        adminId = signUpResponse.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        admintoken = response.data.token;


        const usersignUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + '-user',
            password,
            type: "user"
        });

        userId = usersignUpResponse.userId;

        const userresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        usertoken = userresponse.data.token;

        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        element1Id = element1.id;
        element2Id = element2.id;

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element2Id,
                x: 18,
                y: 20
            }
            ]
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        })

        mapId = map.id;

        const space = await axios.post(`${BACKEND_URL}/api/v1`, {
            "name": "Test",
            "dimensions": "100x200",
            mapId: mapId
        }, {
            headers:
                { authorization: `Bearer ${userToken}` }
        })
        spaceId = space.spaceId;
    });

    test("Incorrect spaceId returns a 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123jaga`, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        });
        expect(response.statusCode).toBe(400);
    })

    test("Correct spaceId returns a 200", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        });
        expect(response.data.dimensions).toBe("100x200")
        expect(response.data.elements.length).toBe(2);
    })

    test("Delete endpoint is able to delete an element", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        });
        await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            spaceId: spaceId,
            elementId: response.data.elements[0].id
        })

        const newResponse = axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        });
        expect(newResponse.data.elements.length).toBe(1);
    })

    test("Adding an element works as expected", async () => {
        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 50,
            "y": 20
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        });

        const newResponse = axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        });
        expect(newResponse.data.elements.length).toBe(2);
    })

    test("Adding an element fails if element lies outside the dimensions", async () => {
        const newResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 1000000,
            "y": 200000900
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        });
        expect(newResponse.statusCode).toBe(400);
    })

})




