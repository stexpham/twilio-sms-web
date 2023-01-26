import Select from 'react-select'
import {useEffect, useState, useCallback} from "react";
import "./PhoneNumberSelector.css"
import {useAuthentication} from "../../context/AuthenticationProvider";
import { getAllTwilioPhoneNumbers } from '../../hook/getTwilioPhoneNumbers';
import { getAllTwilioSenderIds } from '../../hook/getTwilioSenderIds';

// TODO: Currently, this mask is limited to country code +1; we need a mask for all country codes
const maskPhoneNumber = v => {
  let result = v.substr(0, 2)
  result += ' ' + v.substr(2, 3)
  result += ' ' + v.substr(5, 3)
  result += ' ' + v.substr(8)
  return result
}

const PhoneNumberSelector = ({onError = () => {}, onPhoneNumberChange = () => {}}) => {
  const [authentication] = useAuthentication()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [senders, setSenders] = useState([])

  const phoneNumberOptions = phoneNumbers.map(v => ({value: v, label: maskPhoneNumber(v)}))
  const senderOptions = senders.map(v => ({value: v, label: v}))
  const senderAndPhoneNumberOptions = [...senderOptions, ...phoneNumberOptions]
  const placeHolderText = loading ? 'Loading phone numbers...' : 'Select (or type) a phone number...'

  const handleOnError = useCallback((err) => {
    setLoading(false)
    setError(err)
    onError(err)
  }, [setLoading, onError, setError])

  const handleOnChange = (event) => {
    onPhoneNumberChange(event.value)
  }

  const handleGetPhoneNumberSuccess = useCallback((response) => {
    const retrievedNumbers = response
      .flatMap(r => r?.data?.incoming_phone_numbers)
      .filter(pn => pn?.capabilities?.sms)
      .map(pn => pn?.phone_number)
      .sort()
    setPhoneNumbers(retrievedNumbers)
    setLoading(false)
  }, [setPhoneNumbers, setLoading])

  const handleGetSendersSuccess = useCallback((response) => {
    setSenders(response)
    getAllTwilioPhoneNumbers(authentication, 50)
      .then(handleGetPhoneNumberSuccess)
      .catch(handleOnError)
  }, [setSenders, authentication, handleGetPhoneNumberSuccess, handleOnError])

  // Get available phone number on first render
  useEffect(() => {
    if (phoneNumbers.length === 0 && error == null) {
      getAllTwilioSenderIds(authentication, 50)
        .then(handleGetSendersSuccess)
        .catch(handleOnError)
    }
  }, [phoneNumbers, authentication, error, handleGetSendersSuccess, handleOnError])

  return <Select
      placeholder={placeHolderText}
      isLoading={loading}
      options={senderAndPhoneNumberOptions}
      onChange={handleOnChange}
  />
}

export default PhoneNumberSelector
