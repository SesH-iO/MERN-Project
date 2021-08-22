import React, {Fragment, useContext} from 'react';
import {useHistory} from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input/Input';
import Button from '../../shared/components/FormElements/Button/Button';
import {VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE} from '../../shared/util/validators';
import {useForm} from '../../shared/hooks/form-hook';

import './FormPlace.css';
import {useHttpClient} from '../../shared/hooks/http-hook';
import {AuthContext} from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/Spinner/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload/ImageUpload';

const AddPlace = () => {
	const auth = useContext(AuthContext);

	const {isLoading, error, sendRequest, clearError} = useHttpClient();

	const [formState, inputHandler] = useForm(
		{
			title: {
				value: '',
				isValid: false,
			},
			address: {
				value: '',
				isValid: false,
			},
			description: {
				value: '',
				isValid: false,
			},
			image: {
				value: null,
				isValid: false,
			},
		},
		false
	);

	const history = useHistory();

	const placeSubmitHanlder = async (event) => {
		event.preventDefault();

		try {
			const formData = new FormData();
			formData.append('title', formState.inputs.title.value);
			formData.append('description', formState.inputs.description.value);
			formData.append('address', formState.inputs.address.value);
			formData.append('image', formState.inputs.image.value);

			await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places`, 'POST', formData, {
				Authorization: 'Bearer ' + auth.token,
			});
			//Redirected to different Page on Success
			history.push('/');
		} catch (error) {}
	};

	return (
		<Fragment>
			<ErrorModal error={error} onClear={clearError} />
			<form className='place-form' onSubmit={placeSubmitHanlder}>
				{isLoading && <LoadingSpinner asOverlay />}
				<ImageUpload
					center
					id='image'
					onInput={inputHandler}
					errorText='Please provide an image.'
				/>
				<Input
					id='title'
					element='input'
					placeholder='Enter Title'
					type='text'
					label='TITLE'
					validators={[VALIDATOR_REQUIRE()]}
					errorText='Please enter a valid title.'
					onInput={inputHandler}
				/>
				<Input
					id='description'
					element='textarea'
					placeholder='Message'
					type='text'
					label='DESCRIPTION'
					validators={[VALIDATOR_MINLENGTH(10)]}
					errorText='Please enter a valid description (Atleast 5 characters).'
					onInput={inputHandler}
				/>
				<Input
					id='address'
					element='input'
					placeholder='Address'
					type='text'
					label='ADDRESS'
					validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(5)]}
					errorText='Please enter a valid address (Atleast 5 characters).'
					onInput={inputHandler}
				/>
				<Button type='submit' disabled={!formState.isValid}>
					ADD PLACE
				</Button>
			</form>
		</Fragment>
	);
};

export default AddPlace;
