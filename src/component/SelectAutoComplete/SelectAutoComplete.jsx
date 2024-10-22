import { useState, useRef, useEffect } from "react"
import { emptyFn } from "../../js/types"
import { DoubleRightOutlined } from "@ant-design/icons"
import { Select } from "./Select"

const filterOptions = (options = [{ val: "", text: "" }], value = "default", text = "") => {
  if (options.find(o => o.val === value)?.text === text) return options
  return options.filter(o => {
    const t = text.toLowerCase()
    return o.text.toLowerCase().includes(t) || o.val.toLowerCase().includes(t)
  })
}

const optionByValue = (options = [{ val: "", text: "" }], val = "") => options.find(o => o.val === val)

export const SelectAutoComplete = ({
  options = [{ val: "", text: "" }],
  onChange = emptyFn,
  className = "",
  value = "default",
  defaultValue = "default",
  loading = false,
}) => {
  const [text, setText] = useState("")
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef(null)
  const rootRef = useRef(null)
  const filteredOptions = filterOptions(options, value, text)
  const [optionIndex, setOptionIndex] = useState(0)

  useEffect(() => {
    const option = optionByValue(options, value)
    const target = option === undefined ? 0 : filteredOptions.findIndex(o => o.val === value)
    setOptionIndex(target)
  }, [value, options, setOptionIndex])

  const shiftOption = (shift = 0) => {
    const target = optionIndex + shift
    if (target < 0) return
    if (target > filteredOptions.length) return
    console.log({ target, optionShift: optionIndex, filteredOptions, fe: filteredOptions[optionIndex] })
    setOptionIndex(target)
  }

  /**
   * setExpanded(false) on click event if fired
   * outside this component
   */
  useEffect(() => {
    const handleWindowOnClick = event => {
      if (!rootRef.current?.contains(event.target)) {
        setExpanded(false)
      }
    }
    window.addEventListener("click", handleWindowOnClick)
    return () => {
      window.removeEventListener("click", handleWindowOnClick)
    }
  }, [setText, options])

  useEffect(() => {
    const match = optionByValue(options, value)?.text
    if (match !== undefined) {
      setText(match)
    }
  }, [value, options])

  useEffect(() => {
   // eslint-disable-next-line react-hooks/exhaustive-deps
}, []) 

  const handleInputOnKeyDown = ev => {
    if ("ArrowDown" === ev.key) {
      ev.preventDefault()
      shiftOption(1)
    } else if ("ArrowUp" === ev.key) {
      ev.preventDefault()
      shiftOption(-1)
    } else if ("Enter" === ev.key) {
      const { val, text } = filteredOptions[optionIndex]
      setExpanded(false)
      setText(text)
      onChange(val)
    } else {
      setExpanded(true)
    }
  }

  const handleInputOnChange = (val = "") => {
    setText(val)
    if (optionByValue(options, val) !== undefined) {
      onChange(val)
    }
  }

  const handleInputOnFocus = () => {
    const match = options.find(o => {
      const t = text.toLowerCase()
      return o.text.toLowerCase() === t || o.val.toLowerCase() === t
    })
    if (match === undefined) {
      setExpanded(true)
    } else {
      if (match.val === defaultValue) {
        setText("")
        onChange("")
      }
      setExpanded(true)
    }
  }

  const handleInputArrowOnClick = () => {
    setExpanded(v => !v)
  }

  const handleSelectOnChange = (val = "") => {
    const match = optionByValue(filteredOptions, val).text
    setText(match)
    setExpanded(false)
    onChange(val)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        className="w-full border-2 rounded p-2 h-8 border-violet-200"
        value={text}
        onChange={e => handleInputOnChange(e.target.value)}
        onKeyDown={e => handleInputOnKeyDown(e)}
        onFocusCapture={handleInputOnFocus}
      />
      <DoubleRightOutlined
        className="absolute right-1 text-black text-[.6rem] pt-3 h-8"
        rotate="90"
        onClick={handleInputArrowOnClick}
      />
      <Select
        selected={filteredOptions[optionIndex]}
        options={filteredOptions}
        loading={loading}
        onChange={handleSelectOnChange}
        expanded={expanded}
      />
    </div>
  )
}
