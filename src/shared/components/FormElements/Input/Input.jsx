import React, {useReducer, useEffect} from 'react';
import {validate} from '../../../util/validators';
import './Input.css';

const inputReducer = (state, action) => {
	switch (action.type) {
		case 'CHANGE':
			return {
				...state,
				value: action.val,
				isValid: validate(action.val, action.validators),
			};

		case 'TOUCH':
			return {
				...state,
				isTouched: true,
			};

		default:
			return state;
	}
};

const Input = (props) => {
	// * Allows us to manage State in a components adnd it also gives you a function you can call which updates the state and re-renders the components
	// * But the differents to useState is that with useReducer, you can mangae more complex state with ease,
	// * you can write some logic that basically runs whenever you want to change the state to do more complex upadates than just set a new values
	// * So, useReducer is used when we have more complex state or you have interconnected state.
	const [inputState, dispatch] = useReducer(inputReducer, {
		value: props.initialValue || '',
		isTouched: false,
		isValid: props.initialValid || false,
	});

	const {id, onInput} = props;
	const {value, isValid} = inputState;

	useEffect(() => {
		onInput(id, value, isValid);
	}, [id, onInput, value, isValid]);

	const changeHandler = (event) => {
		dispatch({type: 'CHANGE', val: event.target.value, validators: props.validators});
	};

	const touchHandler = (event) => {
		dispatch({type: 'TOUCH'});
	};

	const element =
		props.element === 'input' ? (
			<input
				id={props.id}
				type={props.type}
				placeholder={props.placeholder}
				onChange={changeHandler}
				onBlur={touchHandler}
				value={inputState.value}
			/>
		) : (
			<textarea
				id={props.id}
				rows={props.rows || 3}
				placeholder={props.placeholder}
				onChange={changeHandler}
				onBlur={touchHandler}
				value={inputState.value}
			/>
		);

	return (
		<div
			className={`form-control ${
				!inputState.isValid && inputState.isTouched && 'form-control--invalid'
			}`}
		>
			<label htmlFor={props.id}>{props.label}</label>
			{element}
			{!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
		</div>
	);
};

export default Input;
