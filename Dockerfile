FROM ccr.ccs.tencentyun.com/yoho-base/nodejs

MAINTAINER  feng.chen  <feng.chen@yoho.cn>

ENV NODE_ENV=production \
	NODE_HOME=/tmp/yoho-bi-dashboard
COPY yoho-bi-dashboard.tar.gz /tmp/yoho-bi-dashboard/

WORKDIR /tmp/yoho-bi-dashboard
RUN tar -xzvf yoho-bi-dashboard.tar.gz && \
	rm -f yoho-bi-dashboard.tar.gz
	
EXPOSE 8887
	
CMD ["node","/tmp/yoho-bi-dashboard/server.js"]
