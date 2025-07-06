<template>
    <ul class="navbar-nav me-auto">
        <li class="nav-item">
            <router-link class="nav-link" to="/beatmaps">
                Beatmaps
            </router-link>
        </li>
        <li class="nav-item dropdown">
            <a
                id="questDropdown"
                class="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
            >
                Quests
            </a>
            <ul class="dropdown-menu">
                <li>
                    <router-link class="dropdown-item" to="/missions">
                        Priority quests
                    </router-link>
                </li>
                <li>
                    <router-link class="dropdown-item" to="/quests">
                        Normal quests
                    </router-link>
                </li>
            </ul>
        </li>
        <li class="nav-item">
            <router-link class="nav-link" to="/users">
                Users
            </router-link>
        </li>
        <li class="nav-item">
            <router-link class="nav-link" to="/logs">
                Logs
            </router-link>
        </li>
        <li class="nav-item dropdown">
            <a
                id="contestDropdown"
                class="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
            >
                Contests
            </a>
            <ul class="dropdown-menu">
                <li>
                    <router-link class="dropdown-item" to="/contests/listing">
                        Listing
                    </router-link>
                </li>
                <li>
                    <router-link class="dropdown-item" to="/contests/results">
                        Results
                    </router-link>
                </li>
                <li>
                    <router-link class="dropdown-item" to="/contests/screening">
                        Screening
                    </router-link>
                </li>
                <li>
                    <router-link class="dropdown-item" to="/contests/judging">
                        Judging
                    </router-link>
                </li>
            </ul>
        </li>
        <!--<li class="nav-item">
            <router-link class="nav-link" to="/locus">
                <i>Locus</i>
            </router-link>
        </li>-->
    </ul>
</template>