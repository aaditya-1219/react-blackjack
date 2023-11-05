import React, { useState, useEffect } from "react";

function Card(props) {
	return (
		<img className="card--item" src={props.img} alt="Card" />
	);
}

export default Card;
