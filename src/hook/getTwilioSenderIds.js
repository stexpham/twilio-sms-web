import axios from "axios";
import { Authentication, toCredentials } from "../context/AuthenticationProvider";
import { getAllTwilioServices } from "./getTwilioServices";

const buildUrl = (serviceId = '', pageSize = 8, pageNumber = 0) =>
  `https://messaging.twilio.com/v1/Services/${serviceId}/AlphaSenders?PageSize=${pageSize}&Page=${pageNumber}`


const getTwilioSenderIdsByService = async (authentication = new Authentication(), serviceId = "", pageSize = 50, pageNumber = 0) => {
  return axios.get(
    buildUrl(serviceId, pageSize, pageNumber),
    { auth: toCredentials(authentication) })
}

const getAllTwilioSenderIdsByService = async (authentication = new Authentication(), serviceId = "", pageSize = 50, accumulator = []) => {
  const currentPage = await getTwilioSenderIdsByService(authentication, serviceId, pageSize, accumulator.length)
  const accumulatedPages = [...accumulator, currentPage]
  
  if (currentPage?.data?.meta?.next_page_url !== null) {
    return await getAllTwilioSenderIdsByService(authentication, serviceId, pageSize, accumulatedPages)
  }

  return accumulatedPages
}


export const getAllTwilioSenderIds = async (authentication = new Authentication(), pageSize = 50) => {
  const serviceIdPromises = (await getAllTwilioServices(authentication, pageSize))
    .flatMap(r => r?.data?.services)
    .map(s => s.sid)
    .flatMap(async serviceId => await getAllTwilioSenderIdsByService(authentication, serviceId, pageSize))
  
  return (await Promise.all(serviceIdPromises))
    .flatMap(response => response)
    .flatMap(response => response?.data?.alpha_senders)
}
