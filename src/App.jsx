import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
	const [deckID, setDeckID] = useState(null);
	const [playerCards, setPlayerCards] = useState([]);
	const [dealerCards, setDealerCards] = useState([]);
	const [playerSum, setPlayerSum] = useState(0);
	const [dealerSum, setDealerSum] = useState(0);
	const [loading, setLoading] = useState(false);
	const [gameRunning, setGameRunning] = useState(false);

	function getValue(value) {
		if (value === "ACE") {
			return 11;
		} else if (value === "JACK" || value === "QUEEN" || value === "KING") {
			return 10;
		} else {
			return parseInt(value);
		}
	}
	useEffect(() => {
		async function fetchID() {
			await fetch(
				"https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
			)
				.then((response) => response.json())
				.then((data) => setDeckID(data.deck_id));
		}
		fetchID();
	}, []);

	// Set cards and sum to zero, then draw one card each for player and dealer
	async function newGame() {
		setGameRunning(true);
		setDealerCards([]);
		setPlayerCards([]);
		setDealerSum(0);
		setPlayerSum(0);
	}

	useEffect(() => {
		async function startGame() {
			if (gameRunning && dealerSum == 0 && playerSum == 0) {
				await getPlayerCard();
				await getDealerCard();
			}
		}
		startGame();
	}, [dealerSum, playerSum, gameRunning]);

	useEffect(() => {
		setDealerSum(() => {
			let sum = 0;
			dealerCards.forEach((card) => {
				sum += card.props.value;
			});
			return sum;
		});
	}, [dealerCards]);

	useEffect(() => {
		setPlayerSum(() => {
			if (playerSum > 21) {
				toast("You've gone bust!")
				setGameRunning(false)
			}
			let sum = 0;
			playerCards.forEach((card) => {
				sum += card.props.value;
			});
			return sum;
		});
	}, [playerCards]);

	async function getDealerCard() {
		const response = await fetch(
			`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`
		);

		const data = await response.json();
		const cardValue = getValue(data.cards[0].value);

		setDealerCards((oldCards) => [
			...oldCards,
			<Card
				img={data.cards[0].image}
				key={data.cards[0].code}
				value={cardValue}
			/>,
		]);
		setDealerSum((oldSum) => oldSum + cardValue);

		return cardValue;
	}

	async function getPlayerCard() {
		if (gameRunning) {
			if (playerSum < 17) {
				setLoading(true);
				const response = await fetch(
					`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`
				);
				const data = await response.json();
				const cardValue = getValue(data.cards[0].value);

				setPlayerCards((oldCards) => [
					...oldCards,
					<Card
						img={data.cards[0].image}
						key={data.cards[0].code}
						value={cardValue}
					/>,
				]);
				setPlayerSum((oldSum) => oldSum + getValue(cardValue));
				setLoading(false);
			} else {
				toast("Can't get more cards");
			}
		}
	}
	function decideWinner() {
		console.log("Dealer sum: " + dealerSum + "\nPlayer sum: " + playerSum);
		if (playerSum > 21) {
			toast("Dealer win!")
		} else if (dealerSum > 21) {
			toast("You win!")
		} else {
			if (playerSum > dealerSum) {
				toast("You win!")
			} else if (dealerSum > playerSum) {
				toast("Dealer wins.")
			} else {
				toast("Draw!")
			}
		}
	}
	async function stand() {
		if (gameRunning) {
			let dealerCount = dealerSum;
			while (dealerCount < 17) {
				const cardValue = await getDealerCard();
				dealerCount += cardValue;
			}
			setDealerSum(dealerCount);
			setGameRunning(false)
		}
	}

	useEffect(() => {
		if (dealerSum > 17) {
			setGameRunning(false);
			decideWinner();
		}
	}, [dealerSum]);

	return (
		<div id="container">
			<div className="player--tag">Dealer</div>
			<div id="card--container" className="dealer">
				{dealerCards}
			</div>
			<div id="card--container" className="player">
				{playerCards}
			</div>
			<div className="player--tag">You</div>
			<div id="buttons">
				<button id="startBtn" onClick={newGame}>
					New Game
				</button>
				<button id="hitBtn" onClick={getPlayerCard}>
					Hit
				</button>
				<button id="standBtn" onClick={stand}>
					Stand
				</button>
			</div>
			<ToastContainer
				position="top-right"
				autoClose={1000}
				hideProgressBar
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover={false}
				theme="dark"
			/>
		</div>
	);
}
