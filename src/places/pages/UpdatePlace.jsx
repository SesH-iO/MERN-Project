import React, {Fragment, useEffect, useState, useContext} from 'react';
import {useParams, useHistory} from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button/Button';
import Input from '../../shared/components/FormElements/Input/Input';
import Card from '../../shared/components/UIElements/Card/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/Spinner/LoadingSpinner';
import {AuthContext} from '../../shared/context/auth-context';
import {useForm} from '../../shared/hooks/form-hook';
import {useHttpClient} from '../../shared/hooks/http-hook';

import {VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE} from '../../shared/util/validators';

import './FormPlace.css';

const UpdatePlace = () => {
	const auth = useContext(AuthContext);
	const {isLoading, error, clearError, sendRequest} = useHttpClient();
	const history = useHistory();
	const [loadedPlace, setLoadedPlace] = useState();

	const placeId = useParams().pid;

	const [formState, inputHandler, setFormData] = useForm(
		{
			title: {
				value: '',
				isValid: false,
			},
			description: {
				value: '',
				isValid: false,
			},
		},
		false
	);

	useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const responseData = await sendRequest(`http://localhost:5000/api/places/${placeId}`);
				setLoadedPlace(responseData.place);
				setFormData(
					{
						title: {
							value: responseData.place.title,
							isValid: true,
						},
						description: {
							value: responseData.place.description,
							isValid: true,
						},
					},
					true
				);
			} catch (err) {}
		};

		fetchPlaces();
	}, [sendRequest, placeId, setFormData]);

	const placeUpdateSubmitHandler = async (event) => {
		event.preventDefault();
		try {
			await sendRequest(
				`http://localhost:5000/api/places/${placeId}`,
				'PATCH',
				JSON.stringify({
					title: formState.inputs.title.value,
					description: formState.inputs.description.value,
				}),
				{
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + auth.token,
				}
			);
			history.push('/' + auth.userId + '/places');
		} catch (error) {}
	};

	if (isLoading) {
		return (
			<div className='center'>
				<LoadingSpinner />
			</div>
		);
	}

	if (!loadedPlace && !error)
		return (
			<div className='center'>
				<Card>
					<h2>Could not find the place your looking for!</h2>
				</Card>
			</div>
		);

	return (
		<Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{!isLoading && loadedPlace && (
				<form className='place-form' onSubmit={placeUpdateSubmitHandler}>
					<Input
						id='title'
						element='input'
						placeholder='Enter Title'
						type='text'
						label='TITLE'
						validators={[VALIDATOR_REQUIRE()]}
						errorText='Please enter a valid title.'
						onInput={inputHandler}
						initialValue={loadedPlace.title}
						initialValid={true}
					/>

					<Input
						id='description'
						element='textarea'
						placeholder='Message'
						label='DESCRIPTION'
						validators={[VALIDATOR_MINLENGTH(10)]}
						errorText='Please enter a valid description (Atleast 5 characters).'
						onInput={inputHandler}
						initialValue={loadedPlace.description}
						initialValid={true}
					/>
					<Button type='submit' disabled={!formState.isValid}>
						UPDATE PALCE
					</Button>
				</form>
			)}
		</Fragment>
	);
};

export default UpdatePlace;
