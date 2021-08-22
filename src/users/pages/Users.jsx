import React, {Fragment, useEffect, useState} from 'react';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/Spinner/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';
import UsersList from '../components/UsersList/UsersList';

const Users = () => {
	const [loadedUsers, setLoadedUsers] = useState();

	const {isLoading, error, sendRequest, clearError} = useHttpClient();

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const responseData = await sendRequest('http://localhost:5000/api/users');

				setLoadedUsers(responseData.users);
			} catch (err) {}
		};

		fetchUsers();
	}, [sendRequest]);

	return (
		<Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className='center'>
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
		</Fragment>
	);
};

export default Users;
