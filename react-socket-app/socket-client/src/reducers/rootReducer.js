const initState = {
    sensors:[
        {id: 0,state: "On", name:"Ph",ref:"", link:"" },
        {id: 1,state: "On", name:"temperature",ref:"DS18B20", link:"" },
        {id: 2,state: "On", name:"do",ref:"", link:"" },
        {id: 3,state: "On", name:"ec",ref:"", link:"" },
        {id: 4,state: "On", name:"tds",ref:"", link:"" },
        {id: 5,state: "On", name:"orp",ref:"", link:"" },
        {id: 6,state: "On", name:"turbidity",ref:"", link:"" },
    ], 

    position: {
        lon: "",
        lat: "",
        speed: "",
        cap: ""
    },

    log: {
        state: "Pause", // or Recording
        interval:"10sec" // or 30sec, 1min, 5min, 1hour, 1day 
    }
}

const rootReducer = ( state= initState, action) => {
    return state;
}

export default rootReducer;