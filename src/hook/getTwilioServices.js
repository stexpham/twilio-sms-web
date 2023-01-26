import axios from "axios";
import { Authentication, toCredentials } from "../context/AuthenticationProvider";

const buildUrl = (pageSize = 8, pageNumber = 0) =>
  `https://messaging.twilio.com/v1/Services?PageSize=${pageSize}&Page=${pageNumber}`


const getTwilioServices = async (authentication = new Authentication(), pageSize = 50, pageNumber = 0) => {
  return axios.get(
    buildUrl(pageSize, pageNumber),
    { auth: toCredentials(authentication) })
}


export const getAllTwilioServices = async (authentication = new Authentication(), pageSize = 50, accumulator = []) => {
    const currentPage = await getTwilioServices(authentication, pageSize, accumulator.length)
    const accumulatedPages = [...accumulator, currentPage]

    if (currentPage?.data?.meta?.next_page_url !== null) {
      return await getAllTwilioServices(authentication, pageSize, accumulatedPages)
    }
  
    return accumulatedPages
}
