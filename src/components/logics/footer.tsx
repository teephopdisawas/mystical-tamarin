import React from "react";
import { useState , useEffect } from "react";
import { Button } from "react-day-picker";

export default function Square({ chatBox , sendButton }) {
    return (
        <Button className="send" onClick={sendButton}>
            {chatBox}
        </Button>
    );
}
