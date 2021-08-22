import React, {Fragment, useEffect, useState} from 'react';

import {useParams} from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/Spinner/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';

import PlaceList from '../components/PlaceList/PlaceList';

const UserPlaces = () => {
	const [loadedPlaces, setLoadedPlaces] = useState();
	const {isLoading, error, sendRequest, clearError} = useHttpClient();

	const userId = useParams().uid;

	useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const responseData = await sendRequest(`http://localhost:5000/api/places/user/${userId}`);
				setLoadedPlaces(responseData.userWithPlaces);
			} catch (error) {}
		};
		fetchPlaces();
	}, [sendRequest, userId]);

	const placeDeletedHandler = (deletedPlaceId) => {
		setLoadedPlaces((prevPlaces) => prevPlaces.filter((place) => place.id !== deletedPlaceId));
	};

	return (
		<Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className='center'>
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedPlaces && (
				<PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
			)}
		</Fragment>
	);
};

export default UserPlaces;
