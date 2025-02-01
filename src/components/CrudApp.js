// src/components/CrudApp.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CrudApp = () => {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState({});
    const [user, setUser] = useState({}); // Cambiado a un objeto para múltiples usuarios
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [editing, setEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [userVisible, setUserVisible] = useState({}); // Estado para controlar la visibilidad del usuario por post
    const API_URL = 'https://jsonplaceholder.typicode.com/posts';
    const USERS_URL = 'https://jsonplaceholder.typicode.com/users';

    // Leer datos de la API
    const fetchPosts = async () => {
        const response = await axios.get(API_URL);
        setPosts(response.data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Crear un nuevo post
    const createPost = async () => {
        const response = await axios.post(API_URL, { title, body });
        setPosts([...posts, response.data]);
        setTitle('');
        setBody('');
    };

    // Actualizar un post existente
    const updatePost = async () => {
        const response = await axios.put(`${API_URL}/${currentId}`, { title, body });
        const updatedPosts = posts.map(post => (post.id === currentId ? response.data : post));
        setPosts(updatedPosts);
        setTitle('');
        setBody('');
        setEditing(false);
        setCurrentId(null);
    };

    // Eliminar un post
    const deletePost = async (id) => {
        await axios.delete(`${API_URL}/${id}`);
        setPosts(posts.filter(post => post.id !== id));
        setComments(prevComments => {
            const newComments = { ...prevComments };
            delete newComments[id]; // Eliminar comentarios del post eliminado
            return newComments;
        });
        setUser(prevUser => {
            const newUser = { ...prevUser };
            delete newUser[id]; // Eliminar usuario del post eliminado
            return newUser;
        });
        setUserVisible(prev => ({ ...prev, [id]: false })); // Ocultar datos del usuario al eliminar el post
    };

    // Obtener comentarios de un post
    const fetchComments = async (postId) => {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
        setComments(prevComments => ({
            ...prevComments,
            [postId]: response.data // Guardar comentarios por postId
        }));
    };

    // Obtener información del usuario
    const fetchUser = async (userId, postId) => {
        const response = await axios.get(`${USERS_URL}/${userId}`);
        setUser(prevUser => ({
            ...prevUser,
            [postId]: response.data // Guardar información del usuario por postId
        }));
    };

    // Manejar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        editing ? updatePost() : createPost();
    };

    // Cargar datos para editar
    const editPost = (post) => {
        setTitle(post.title);
        setBody(post.body);
        setEditing(true);
        setCurrentId(post.id);
    };

    // Ver comentarios para un post específico
    const toggleComments = (postId) => {
        if (comments[postId]) {
            delete comments[postId]; // Si ya están cargados, eliminarlos
            setComments({ ...comments }); // Actualizar el estado
        } else {
            fetchComments(postId); // Cargar comentarios si no están
        }
    };

    // Ver datos del usuario para el post específico
    const viewUserData = (userId, postId) => {
        if (userVisible[postId] && user[postId] && user[postId].id === userId) {
            setUserVisible(prev => ({ ...prev, [postId]: false })); // Ocultar si ya está visible
            setUser(prevUser => {
                const newUser = { ...prevUser };
                delete newUser[postId]; // Limpiar usuario
                return newUser;
            });
        } else {
            fetchUser(userId, postId);
            setUserVisible(prev => ({ ...prev, [postId]: true })); // Mostrar datos del usuario
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">CRUD con JSONPlaceholder</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Título"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <textarea
                        className="form-control"
                        placeholder="Contenido"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    {editing ? 'Actualizar' : 'Crear'}
                </button>
            </form>
            <ul className="list-group">
                {posts.map(post => (
                    <li key={post.id} className="list-group-item">
                        <h2>{post.title}</h2>
                        <p>{post.body}</p>
                        <button className="btn btn-warning mr-2" onClick={() => editPost(post)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => deletePost(post.id)}>Eliminar</button>
                        <button className="btn btn-info" onClick={() => toggleComments(post.id)}>Ver Comentarios</button>
                        <button className="btn btn-secondary" onClick={() => viewUserData(post.userId, post.id)}>Ver Datos del Usuario</button>

                        {/* Mostrar información del usuario como acordeón */}
                        {userVisible[post.id] && user[post.id] && (
                            <div className="mt-2">
                                <h4>Información del Usuario</h4>
                                <p><strong>Nombre:</strong> {user[post.id].name}</p>
                                <p><strong>Usuario:</strong> {user[post.id].username}</p>
                                <p><strong>Email:</strong> {user[post.id].email}</p>
                                <p><strong>Dirección:</strong> {user[post.id].address.street}, {user[post.id].address.suite}, {user[post.id].address.city}, {user[post.id].address.zipcode}</p>
                                <p><strong>Teléfono:</strong> {user[post.id].phone}</p>
                                <p><strong>Sitio Web:</strong> {user[post.id].website}</p>
                            </div>
                        )}

                        {/* Mostrar comentarios como acordeón, debajo de la información del usuario */}
                        {comments[post.id] && (
                            <div className="mt-2">
                                <h3>Comentarios para: {post.title}</h3>
                                <ul className="list-group">
                                    {comments[post.id].map(comment => (
                                        <li key={comment.id} className="list-group-item">
                                            <strong>{comment.name}</strong>
                                            <p>{comment.body}</p>
                                            <small>Por: {comment.email}</small>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CrudApp;