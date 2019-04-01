FROM gitpod/workspace-full:latest

USER root

RUN apt-get update
&& apt-get install -y mc \
&& apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/* \
&& echo "gitpod ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/gitpod \
&& chmod 0440 /etc/sudoers.d/gitpod