import React, {Fragment, useContext, useState} from 'react';
import Button from '../../../../shared/components/FormElements/Button/Button';
import Card from '../../../../shared/components/UIElements/Card/Card';
import ErrorModal from '../../../../shared/components/UIElements/ErrorModal';
import Maps from '../../../../shared/components/UIElements/Maps/Maps';
import Modal from '../../../../shared/components/UIElements/Modal/Modal';
import LoadingSpinner from '../../../../shared/components/UIElements/Spinner/LoadingSpinner';
import {AuthContext} from '../../../../shared/context/auth-context';
import {useHttpClient} from '../../../../shared/hooks/http-hook';

import './PlaceItem.css';

const PlaceItem = (props) => {
	const auth = useContext(AuthContext);

	const {isLoading, error, sendRequest, clearError} = useHttpClient();

	const [showMap, setShowMap] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const openMapHandler = () => setShowMap(true);
	const closeMapHandler = () => setShowMap(false);

	const showDeleteModalHandler = () => setShowConfirmModal(true);
	const cancelDeleteModalHandler = () => setShowConfirmModal(false);
	const confirmDeleteModalHandler = async () => {
		setShowConfirmModal(false);
		try {
			await sendRequest(`http://localhost:5000/api/places/${props.id}`, 'DELETE', null, {
				Authorization: 'Bearer ' + auth.token,
			});
			props.onDelete(props.id);
		} catch (error) {}
	};

	return (
		<Fragment>
			<ErrorModal error={error} onClear={clearError} />
			<Modal
				show={showMap}
				onCancel={closeMapHandler}
				header={props.address}
				conetentClass='place-item__modal-content'
				footerClass='place-item__modal-actions'
				footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
			>
				<div className='map-container'>
					<Maps center={props.coordinates} zoom={16} />
				</div>
			</Modal>
			<Modal
				show={showConfirmModal}
				onCancel={cancelDeleteModalHandler}
				header='Are you sure?'
				footerClass='place-item__modal-actions'
				footer={
					<Fragment>
						<Button inverse onClick={cancelDeleteModalHandler}>
							CANCEL
						</Button>
						<Button danger onClick={confirmDeleteModalHandler}>
							DELETE
						</Button>
					</Fragment>
				}
			>
				<p>
					Do You Want to proceed and delete this place? please note that it can't be undone
					thereafter.
				</p>
			</Modal>
			<li className='place-item'>
				<Card className='place-item__content'>
					{isLoading && <LoadingSpinner asOverlay />}
					<div className='place-item__image'>
						<img src={`http://localhost:5000/${props.image}`} alt={props.title} />
					</div>
					<div className='place-item__info'>
						<h2>{props.title}</h2>
						<h3>{props.address}</h3>
						<p>{props.desc}</p>
					</div>
					<div className='place-item__actions'>
						<Button onClick={openMapHandler} inverse>
							VIEW ON MAP
						</Button>
						{auth.userId === props.creatorId && <Button to={`/places/${props.id}`}>EDIT</Button>}
						{auth.userId === props.creatorId && (
							<Button danger onClick={showDeleteModalHandler}>
								DELETE
							</Button>
						)}
					</div>
				</Card>
			</li>
		</Fragment>
	);
};

export default PlaceItem;
