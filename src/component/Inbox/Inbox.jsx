import { useEffect, useState } from "react"
import { DockedLayout } from "../DockedLayout/DockedLayout"
import { getTwilioMessages } from "../../js/getTwilioMessages"
import { MessageRows } from "../MessageRows/MessageRows"
import { Selector } from "./Selector"
export const Inbox = () => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    getTwilioMessages().then(setMessages)
  }, [])

  return (
    <DockedLayout>
      <h3>Inbox</h3>
      <p className="text-xs italic">Your most recent incoming messages</p>
      <Selector></Selector>
      <MessageRows messages={messages} />
    </DockedLayout>
  )
}