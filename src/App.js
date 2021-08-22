import React, {Suspense} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {Route, Switch, Redirect} from 'react-router-dom';

import MainNavigation from './shared/components/Navigation/MainNavigation/MainNavigation';
import LoadingSpinner from './shared/components/UIElements/Spinner/LoadingSpinner';
// import Auth from './users/pages/Auth/Auth';
// import UpdatePlace from './places/pages/UpdatePlace';
// import UserPlaces from './places/pages/UserPlaces';
// import AddPlace from './places/pages/AddPlace';
// import Users from './users/pages/Users';
import {AuthContext} from './shared/context/auth-context';
import {useAuth} from './shared/hooks/auth-hook';

const Users = React.lazy(() => import('./users/pages/Users'));
const AddPlace = React.lazy(() => import('./places/pages/AddPlace'));
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'));
const Auth = React.lazy(() => import('./users/pages/Auth/Auth'));

function App() {
	const {token, login, logout, userId} = useAuth();

	let routes;

	if (token) {
		routes = (
			<Switch>
				<Route path='/' exact>
					<Users />
				</Route>
				<Route path='/:uid/places' exact>
					<UserPlaces />
				</Route>
				<Route path='/places/new' exact>
					<AddPlace />
				</Route>
				<Route path='/places/:pid' exact>
					<UpdatePlace />
				</Route>
				<Redirect to='/' />
			</Switch>
		);
	} else {
		routes = (
			<Switch>
				<Route path='/' exact>
					<Users />
				</Route>
				<Route path='/:uid/places' exact>
					<UserPlaces />
				</Route>
				<Route path='/auth'>
					<Auth />
				</Route>
				<Redirect to='/auth' />
			</Switch>
		);
	}
	return (
		<AuthContext.Provider
			value={{
				isLoggedIn: !!token,
				token: token,
				userId: userId,
				login: login,
				logout: logout,
			}}
		>
			<Router>
				<MainNavigation />
				<main>
					<Suspense
						fallback={
							<div className='center'>
								<LoadingSpinner />
							</div>
						}
					>
						{routes}
					</Suspense>
				</main>
			</Router>
		</AuthContext.Provider>
	);
}

export default App;
