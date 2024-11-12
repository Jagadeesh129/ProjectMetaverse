const axios = require("axios");

const BACKEND_URL = "https://localhost:3000";

const WEBSOCKET_URL = "ws://localhost:3001";

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
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }
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
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }})
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

        userId = signUpResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token = response.data.token;

        const avtarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avtar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }})

        avtarId = avtarResponse.data.avtarId;
    });

    test("Get avtar Information for an user", async () => {
        const response = await axios.getAdapter(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`, {
            headers: {
                authorization: `Bearer ${token}`
            }});

        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avtars[0].useId.toBe(userId))
    })

    test("Available avatars list", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/avatars`, {
            headers: {
                authorization: `Bearer ${token}`
            }});
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

        adminId = signUpResponse.data.userId;

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

        userId = usersignUpResponse.data.userId;

        const userresponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        usertoken = userresponse.data.token;

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

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

        mapId = map.data.id;

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

        expect(response.data.spaceId).toBeDefined();
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

        expect(response.data.spaceId).toBeDefined();
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

        const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateresponse.data.spaceId);
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

        adminId = signUpResponse.response.adminId;

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

        userId = usersignUpResponse.data.userId;

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

        element1Id = element1.data.id;
        element2Id = element2.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
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

        mapId = mapResponse.data.id;

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1`, {
            "name": "Test",
            "dimensions": "100x200",
            mapId: mapId
        }, {
            headers:
                { authorization: `Bearer ${userToken}` }
        })
        spaceId = spaceResponse.data.spaceId;
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
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }})

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

describe("Admin Endpoints", () => {
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

        adminId = signUpResponse.data.userId;

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
    });

    test('User is not able to hit admin Endpoints', async () => {
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        });



        element1Id = element1Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        const avtarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avtar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
        }, {
            headers: {
                authorization: `Bearer ${usertoken}`
            }
        })

        mapId = map.response.id;
        expect(element1Response.statusCode).toBe(403);
        expect(mapResponse.statusCode).toBe(403);
        expect(avtarResponse.statusCode).toBe(403);
        expect(updateElementResponse.statusCode).toBe(403);
    })

    test('Admin able to hit admin Endpoints', async () => {
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        element1Id = element1Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        })

        const avtarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avtar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        })

        mapId = map.id;
        expect(element1Response.statusCode).toBe(200);
        expect(mapResponse.statusCode).toBe(200);
        expect(avtarResponse.statusCode).toBe(200);
    })

    test("Admin is able to update the imageUrl for an element",async()=>{
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        });

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
        }, {
            headers: {
                authorization: `Bearer ${admintoken}`
            }
        })

        expect(updateElementResponse.statusCode).toBe(200);
    })
})

describe("Websockets Tests",()=>{
    let mapId;
    let element1Id;
    let element2Id;
    let admintoken;
    let adminId;
    let usertoken;
    let userId;
    let spaceId;
    let ws1messages = [];
    let ws2messages = [];
    let userX;
    let userY;
    let adminX;
    let adminY;
    let ws1;
    let ws2;

    function waitForAndPopulatestMessage(messageArray){
        return new Promise(r=>{
            if(messageArray.length>0){
                resolve(messageArray.shift())
            }
            else{
                let interval = setInterval(()=>{
                    if(messageArray.length>0){
                        resolve(messageArray.shift())
                        clearInterval(interval);
                    }
                },100)
            }
        })
    }

    async function setupHTTP(){
        const username = `jaga-${Math.random()}`;
        const password = '123456';

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            role: "admin"
        });

        adminId = signUpResponse.data.adminId;

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

        userId = usersignUpResponse.data.userId;

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

        element1Id = element1.data.id;
        element2Id = element2.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
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

        mapId = mapResponse.data.id;

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1`, {
            "name": "Test",
            "dimensions": "100x200",
            mapId: mapId
        }, {
            headers:
                { authorization: `Bearer ${userToken}` }
        })
        spaceId = spaceResponse.data.spaceId;
    }

    async function setUpWebSockets(){
        ws1 = new WebSocket(WEBSOCKET_URL);

        await new Promise(r => {
            ws1.onopen = r
        })

        ws1.onmessage = (event) => {
            ws1messages.push(JSON.parse(event.data))
        }

        ws2 = new WebSocket(WEBSOCKET_URL);

        await new Promise(r => {
            ws2.onopen = r
        }) 

        ws2.onmessage = (event) => {
            ws2messages.push(JSON.parse(event.data))
        }

        ws1.send(JSON.stringify({
            "type":"join",
            "payload": {
                "spaceId" : spaceId,
                "token" : admintoken
            }
        }))

        ws2.send(JSON.stringify({
            "type":"join",
            "payload": {
                "spaceId" : spaceId,
                "token" : admintoken
            }
        }))
    }

    beforeAll(async () => {
        setUpWebSockets();
        setupHTTP();
    });

    test("Get back ack for joining the space",async ()=>{
        ws1.send(JSON.stringify({
            "type":"join",
            "payload": {
                "spaceId" : spaceId,
                "token" : usertoken
            }
        }))

        ws2.send(JSON.stringify({
            "type":"join",
            "payload": {
                "spaceId" : spaceId,
                "token" : usertoken
            }
        }))

        const message1 = await waitForAndPopulatestMessage(ws1messages);
        const message2 = await waitForAndPopulatestMessage(ws2messages);

        expect(message1.type).toBe("space-joined");
        expect(message2.type).toBe("space-joined");

        expect(message1.payload.users.length + message2.payload.users.length).toBe(1);
        adminX = message1.payload.spawn.x;
        adminY = message2.payload.spawn.y;

        userX = message1.payload.spawn.x;
        userY = message2.payload.spawn.y;
    })

    test("User should not be able to move two block at same time",async ()=> {
        ws1.send(JSON.stringify({
            type:"movement",
            payload: {
                x: adminX+2,
                y:adminY
            }
        }));

        const message = await waitForAndPopulatestMessage(ws1messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    })

    test("Correct movement should be broadcasted to other sockets in the room",async ()=> {
        ws1.send(JSON.stringify({
            type:"movement",
            payload: {
                x: adminX+1,
                y:adminY,
                userId:adminId
            }
        }));

        const message = await waitForAndPopulatestMessage(ws1messages);
        expect(message.type).toBe("movement");
        expect(message.payload.x).toBe(adminX+1);
        expect(message.payload.y).toBe(adminY);
    })

    test("If user leaves other user recieves a leave event",async ()=> {
        ws1.close();

        const message = await waitForAndPopulatestMessage(ws2messages);
        expect(message.type).toBe("user-left");
        expect(message.payload.userId).toBe(adminId);
    })
})