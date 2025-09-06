// src/features/courses/components/ClassifierTest.jsx
import React, { useState } from 'react';
import api from '../../../api/axiosConfig'; // Assurez-vous que le chemin est correct

function ClassifierTest() {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClassify = async () => {
        if (!text) {
            setError('Veuillez entrer un sujet.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const response = await api.post(`/capsules/classify-topic/?text_input=${encodeURIComponent(text)}`);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', border: '1px solid #ccc', margin: '2rem', borderRadius: '8px' }}>
            <h2>🧪 Test du Classifieur de Sujet 2</h2>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: apprendre python, les hiragana, etc."
                style={{ width: '300px', padding: '8px', marginRight: '10px' }}
            />
            <button onClick={handleClassify} disabled={loading}>
                {loading ? 'Classification...' : 'Classifier'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {result && (
                <div style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem' }}>
                    <h3>Résultat de la classification :</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default ClassifierTest;