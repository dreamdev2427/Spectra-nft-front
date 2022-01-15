import React, { memo, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import UserTopSeller from './UserTopSeller';
import * as selectors from '../../store/selectors';
import { fetchAuthorList } from "../../store/actions/thunks";

const AuthorList = ({authorId="", limit = 8}) => {
    
    const dispatch = useDispatch();
    const authorsState = useSelector(selectors.authorsState);
    const authors = authorsState.data ? authorsState.data : [];

    useEffect(() => {
        dispatch(fetchAuthorList(authorId, limit));
    }, [dispatch, authorId, limit]);

    return (
        <div>
            <ol className="author_list">
            { authors && Array.isArray(authors) && authors.map((author, index) => (
                <li key={index}>
                    <UserTopSeller user={author} />
                </li>
            ))}
            </ol>
        </div>
    );
};
export default memo(AuthorList);