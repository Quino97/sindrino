import { mount } from 'svelte';
import Admin from './Admin.svelte';
import '../styles.css';
import './site.css';
import './admin.css';
mount(Admin, { target: document.getElementById('app') });
