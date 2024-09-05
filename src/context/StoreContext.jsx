import { createContext, useEffect, useState } from "react";
import { food_list } from "../assets/assets";
import axios from 'axios'

export const StoreContext= createContext(null);

const StoreContextProvider= (props)=>{

    const [cartItems, setCartItems]= useState({});
    const url= "http://localhost:4000"
    const [token, setToken]= useState("");
    const [food_list, setFoodList]= useState([])


    const addToCart = async (itemId) => {
        if(!cartItems[itemId]){
            setCartItems((prev)=>({...prev,[itemId]:1}))
        }else{
            setCartItems((prev)=> ({...prev,[itemId]:prev[itemId]+1}))
        }
        // what ever items is in the cart we will update in the database also
        if(token){
            await axios.post(url+"/api/cart/add", {itemId}, {headers:{token}})
        }
    }


    const removeFromCart= async (itemId)=>{
        setCartItems((prev)=> ({...prev, [itemId]:prev[itemId]-1}));
        if(token){
            await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}});
        }
    }

    // useEffect(()=>{
    //     console.log(cartItems);
    // },[cartItems])
    const getTotalCartAmount = () => {
        let totalAmount= 0;
        for(const item in cartItems){
            if(cartItems[item] > 0){
                let itemInfo = food_list.find((product)=> product._id === item);
                totalAmount += itemInfo.price* cartItems[item];
            }
        }

        return totalAmount;
    }

    const fetchFoodList= async()=>{
        const response = await axios.get(url+"/api/food/list");
        setFoodList(response.data.data);
    }
        // if we refresh the page so all the food items comes to 0 in home page
    const loadCartData = async (token)=>{
        const response= await axios.post(url+"/api/cart/get",{},{headers:{token}});
        setCartItems(response.data.cartData);
    }


// //  if we reload the web page we are getting logged out toh usko na hone ke liye below is the code
    useEffect(()=>{
        async function loadData(){
            await fetchFoodList();
            if(localStorage.getItem("token")){
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token"))
            }
        }
        loadData();
    },[])




    const contextValue= {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken
    }
    return(
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;