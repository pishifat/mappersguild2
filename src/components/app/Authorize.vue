<template>
    <section key="login" class="card card-body mt-4">
        <div class="row">
            <div class="col-lg-5">
                <div class="text-center landing">
                    <img
                        class="mb-1"
                        src="/images/mg-logo.png"
                        style="width: 150px; min-width: 150px;"
                    />
                    <div class="fs-4">
                        Mappers' Guild
                    </div>
                </div>

                <hr />

                <div class="text-danger text-center mb-2">
                    <b>Log in to view this page!</b>
                </div>

                <div class="text-center">
                    <a href="/api/login" class="btn btn-primary mb-2">
                        authorize your osu! account
                        <i class="fas fa-external-link-alt" />
                    </a>
                </div>
            </div>
            <div class="col-lg-7 d-flex flex-column justify-content-center">
                <p>"Authorizing" will identify you through your osu! account.</p>
                <p>You can do any of these after authorization:</p>
                <ul>
                    <!--<li>Use <a href="https://osu.ppy.sh/home/news/2025-01-31-locus">Locus</a>'s Nexus</li>-->
                    <li>View "Beatmaps", "Quests", and "Contests" pages</li>
                    <li>Participate to earn <a href="https://osu.ppy.sh/wiki/Community/Mappers_Guild#rewards">Mappers' Guild rewards on osu!</a>.</li>
                    <li>...a bunch of other mapping-related stuff</li>
                </ul>
            </div>
        </div>
    </section>
</template>